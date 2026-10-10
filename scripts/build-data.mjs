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
 *   3. 補正     … enrichment.json の override で項目を上書き / hidden で非掲載
 *   4. 地域文脈 … アクセス情報から localNote を自動抽出し、人手のメモとマージ
 *   5. 検証     … 必須項目・形式・カテゴリを検証。エラーがあれば終了コード1
 */
import path from 'node:path';
import { categories } from '../src/data/categories.ts';
import { paths, DATASETS } from './lib/paths.mjs';
import { readJson, readJsonDir, today, writeJson } from './lib/io.mjs';
import { cleanText, makeId, normalizeTel, normalizeUrl, toHalfWidth } from './lib/normalize.mjs';
import { inferLocalNotes, mergeLocalNotes } from './lib/local-context.mjs';
import { RAW_FIELDS, validatePlace } from './lib/schema.mjs';

const checkOnly = process.argv.includes('--check');
const enrichment = await readJson(paths.enrichment, {});
const usedEnrichment = new Set();
const categoryOrder = new Map(categories.map((c, i) => [c.slug, i]));
const SOURCE_PRIORITY = { mock: 0, scrape: 1, manual: 2 };

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

  return {
    id,
    ...base,
    localNote: mergeLocalNotes(inferLocalNotes(base.access), extra?.localNote),
    source: extra?.override ? 'manual' : raw.source ?? 'scrape',
    updatedAt: (raw.fetchedAt ?? today()).slice(0, 10),
  };
}

for (const [dataset, section] of Object.entries(DATASETS)) {
  const slugs = new Set(categories.filter((c) => c.section === section).map((c) => c.slug));
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

  const places = [...byId.values()].sort(
    (a, b) => (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99),
  );

  let invalid = 0;
  for (const place of places) {
    const errors = validatePlace(place, slugs);
    if (errors.length > 0) {
      invalid++;
      console.error(`✖ ${dataset}/${place.id}（${place.name ?? '名称なし'}）\n    - ${errors.join('\n    - ')}`);
    }
  }
  if (invalid > 0) hasError = true;

  const out = path.relative(paths.root, paths.output[dataset]);
  const notes = places.reduce((n, p) => n + p.localNote.length, 0);
  if (!checkOnly && invalid === 0) await writeJson(paths.output[dataset], places);
  console.log(
    `${invalid === 0 ? '✔' : '✖'} ${out}: ${places.length}件（入力 ${files.length}ファイル / localNote ${notes}件${invalid ? ` / エラー ${invalid}件` : ''}）${checkOnly ? ' [check]' : ''}`,
  );
}

const orphans = Object.keys(enrichment).filter((id) => !usedEnrichment.has(id));
if (orphans.length > 0) {
  console.warn(`⚠ enrichment.json に対応するデータがない ID があります（店舗名・住所の変更でIDが変わった可能性）:\n    ${orphans.join('\n    ')}`);
}

if (hasError) process.exit(1);
