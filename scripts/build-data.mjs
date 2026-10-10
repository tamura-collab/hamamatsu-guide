#!/usr/bin/env node
/**
 * 生データ（data/raw）と人手の補正（data/enrichment.json）を統合し、
 * サイトが読み込む src/data/stores.json / spots.json を生成する。
 *
 *   npm run data:build              # 生成
 *   npm run data:build -- --check   # 検証のみ（ファイルは書き換えない。CI 向け）
 *
 * 処理内容:
 *   1. 正規化   … 全角→半角、空白整理、電話番号の書式統一、URL検証
 *   2. ID付与   … カテゴリ + 店舗名 + 住所から安定IDを生成
 *   3. 補正     … enrichment.json の override / specs で項目を上書き、hidden で非掲載、affiliate で広告リンクを設定
 *   4. 地域文脈 … アクセス情報から localNote を自動抽出し、人手のメモとマージ
 *   5. 比較軸   … specs をカテゴリの比較軸（categories.ts の axes）の型に変換し、
 *                 駅徒歩（stationWalkMin）・駐車場（parking）はアクセス情報から自動算出
 *   6. 検証     … 必須項目・形式・カテゴリ・比較軸を検証。エラーがあれば終了コード1
 */
import path from 'node:path';
import { categories } from '../src/data/categories.ts';
import { paths, DATASETS } from './lib/paths.mjs';
import { readJson, readJsonDir, today, writeJson } from './lib/io.mjs';
import { cleanText, makeId, normalizeTel, normalizeUrl, toHalfWidth } from './lib/normalize.mjs';
import { inferLocalNotes, mergeLocalNotes } from './lib/local-context.mjs';
import { RAW_FIELDS, coerceSpec, validatePlace } from './lib/schema.mjs';

const checkOnly = process.argv.includes('--check');
const enrichment = await readJson(paths.enrichment, {});
const usedEnrichment = new Set();
const categoryOrder = new Map(categories.map((c, i) => [c.slug, i]));
const SOURCE_PRIORITY = { mock: 0, scrape: 1, manual: 2 };
const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

/** localNote の駅メモ（「浜松駅徒歩5分」）から最短の徒歩分数を得る */
function deriveStationWalk(notes) {
  const mins = notes.filter((n) => n.type === 'station').map((n) => Number(n.text.match(/徒歩(\d+)分/)?.[1]));
  const valid = mins.filter(Number.isFinite);
  return valid.length > 0 ? Math.min(...valid) : null;
}

/** アクセス情報から駐車場の有無を判定する（判定できなければ null） */
function deriveParking(access) {
  if (!access) return null;
  if (/駐車場(?:なし|無し|無)/.test(access)) return false;
  if (/駐車場/.test(access)) return true;
  return null;
}

/** 生の specs を比較軸の型に変換し、自動算出できる軸を補う */
function buildSpecs(id, category, rawSpecs, overrideSpecs, derived) {
  const specs = {};
  const input = { ...rawSpecs, ...overrideSpecs };
  for (const axis of category?.axes ?? []) {
    // 未収集の軸は自動算出値（駅徒歩・駐車場）か null。値があるのに解釈できない場合だけ警告する
    let value = axis.key in input ? coerceSpec(axis, input[axis.key]) : (derived[axis.key] ?? null);
    if (value === undefined) {
      console.warn(`  ⚠ ${id}: specs.${axis.key} の値 ${JSON.stringify(input[axis.key])} を解釈できないため空欄にしました`);
      value = null;
    }
    specs[axis.key] = value ?? null;
  }
  // 比較軸にないキーは検証でエラーにするため残す
  for (const key of Object.keys(input)) if (!(key in specs)) specs[key] = input[key];
  return specs;
}

let hasError = false;

function normalizeRecord(raw) {
  const base = {
    name: cleanText(raw.name),
    category: cleanText(raw.category),
    genre: cleanText(raw.genre),
    address: toHalfWidth(raw.address),
    tel: normalizeTel(raw.tel),
    hours: toHalfWidth(raw.hours),
    access: toHalfWidth(raw.access),
    officialUrl: normalizeUrl(raw.officialUrl),
    description: cleanText(raw.description),
  };
  const id = raw.id ?? makeId(base.category, base.name, base.address);
  const extra = enrichment[id];
  if (extra) usedEnrichment.add(id);
  if (extra?.hidden) return null;

  // 人手の補正を反映（キーは RAW_FIELDS のみ許可）
  for (const [key, value] of Object.entries(extra?.override ?? {})) {
    if (key in RAW_FIELDS) base[key] = key === 'tel' ? normalizeTel(value) : cleanText(value);
    else console.warn(`  ⚠ ${id}: override の不明なキー "${key}" を無視しました`);
  }

  // 手入力データ（raw の localNote）と enrichment の人手メモを統合。enrichment が優先
  const manualNotes = [...(extra?.localNote ?? []), ...(raw.localNote ?? [])];
  const localNote = mergeLocalNotes(inferLocalNotes(base.access), manualNotes);
  const specs = buildSpecs(id, categoryBySlug.get(base.category), raw.specs, extra?.specs, {
    stationWalkMin: deriveStationWalk(localNote),
    parking: deriveParking(base.access),
  });
  const affiliate = extra?.affiliate
    ? {
        url: normalizeUrl(extra.affiliate.url),
        label: cleanText(extra.affiliate.label),
        program: cleanText(extra.affiliate.program),
      }
    : null;

  return {
    id,
    ...base,
    localNote,
    specs,
    /** 特徴タグ（表示用） */
    features: (extra?.features ?? raw.features ?? []).map(cleanText).filter(Boolean),
    /** 店舗固有の料金注記（例: 「コース制のため月額表示なし」） */
    priceNote: cleanText(extra?.priceNote ?? raw.priceNote),
    /** 複数店舗をまとめた掲載（住所は代表店舗またはエリア） */
    chain: Boolean(extra?.chain ?? raw.chain ?? false),
    /** store: 実店舗 / online: Web完結のサービス（地図・住所の扱いが変わる） */
    serviceType: extra?.serviceType ?? raw.serviceType ?? 'store',
    // アフィリエイトリンクは提携契約に基づく情報のため、収集データではなく enrichment.json でのみ設定する
    affiliate,
    source: extra?.override || extra?.specs ? 'manual' : raw.source ?? 'scrape',
    updatedAt: (raw.fetchedAt ?? today()).slice(0, 10),
  };
}

for (const [dataset, section] of Object.entries(DATASETS)) {
  const allowed = new Map(categories.filter((c) => c.section === section).map((c) => [c.slug, c]));
  const byId = new Map();
  const files = await readJsonDir(paths.raw[dataset]);

  for (const { name: file, data } of files) {
    if (!Array.isArray(data)) {
      console.error(`✖ data/raw/${dataset}/${file}: 配列ではありません`);
      hasError = true;
      continue;
    }
    for (const raw of data) {
      const place = normalizeRecord(raw);
      if (!place) continue;
      const prev = byId.get(place.id);
      // 同一店舗が複数ソースにある場合は優先度の高いソース（manual > scrape > mock）を採用
      if (prev && SOURCE_PRIORITY[prev.source] > SOURCE_PRIORITY[place.source]) continue;
      byId.set(place.id, place);
    }
  }

  // 実データ（manual / scrape）があるカテゴリでは、モックデータを掲載しない
  const realCategories = new Set([...byId.values()].filter((p) => p.source !== 'mock').map((p) => p.category));
  for (const [id, p] of byId) {
    if (p.source === 'mock' && realCategories.has(p.category)) byId.delete(id);
  }
  if (realCategories.size > 0) console.log(`  実データに置き換えたカテゴリ（${dataset}）: ${[...realCategories].join(', ')}`);

  const places = [...byId.values()].sort(
    (a, b) => (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99),
  );

  let invalid = 0;
  for (const place of places) {
    const errors = validatePlace(place, allowed);
    if (errors.length > 0) {
      invalid++;
      console.error(`✖ ${dataset}/${place.id}（${place.name ?? '名称なし'}）\n    - ${errors.join('\n    - ')}`);
    }
  }
  if (invalid > 0) hasError = true;

  const out = path.relative(paths.root, paths.output[dataset]);
  const notes = places.reduce((n, p) => n + p.localNote.length, 0);
  const affiliates = places.filter((p) => p.affiliate).length;
  if (!checkOnly && invalid === 0) await writeJson(paths.output[dataset], places);
  console.log(
    `${invalid === 0 ? '✔' : '✖'} ${out}: ${places.length}件（入力 ${files.length}ファイル / localNote ${notes}件 / 広告リンク ${affiliates}件${invalid ? ` / エラー ${invalid}件` : ''}）${checkOnly ? ' [check]' : ''}`,
  );
}

const orphans = Object.keys(enrichment).filter((id) => !usedEnrichment.has(id));
if (orphans.length > 0) {
  console.warn(`⚠ enrichment.json に対応するデータがない ID があります（店舗名・住所の変更でIDが変わった可能性）:\n    ${orphans.join('\n    ')}`);
}

if (hasError) process.exit(1);
