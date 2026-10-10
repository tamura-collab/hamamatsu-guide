#!/usr/bin/env node
/**
 * 一覧ページから店舗・施設情報を収集し、data/raw/{dataset}/{name}.json に保存する。
 *
 *   npm run data:scrape                                   # enabled: true のソースをすべて実行
 *   npm run data:scrape -- --source=sample-fixture        # 指定ソースのみ（enabled を無視）
 *   npm run data:scrape -- --source=sample-fixture --dry-run  # 保存せず結果を表示
 *
 * マナー:
 *   - リクエスト間に必ず 1.5 秒以上のインターバルを挟む
 *   - robots.txt で Disallow されている URL は取得しない
 *   - 連絡先を含む User-Agent を名乗る
 * 収集後は `npm run data:build` で正規化・地域文脈の付与を行う。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import sources from './sources.config.mjs';
import { paths } from './lib/paths.mjs';
import { sleep, today, writeJson } from './lib/io.mjs';

const REQUEST_INTERVAL_MS = 1500;
// 連絡先としてサイトのお問い合わせページを名乗る（SITE_URL 未設定時は README の案内に従い設定すること）
const USER_AGENT = `LocalMediaBot/0.1 (+${(process.env.SITE_URL ?? 'http://localhost:4321').replace(/\/$/, '')}/contact)`;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

// ---------- 取得 ----------

let lastRequestAt = 0;
async function politeWait() {
  const wait = lastRequestAt + REQUEST_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

const robotsCache = new Map();
/** robots.txt の「User-agent: *」グループの Disallow を簡易判定する */
async function isAllowed(url) {
  const { origin, pathname } = new URL(url);
  if (!robotsCache.has(origin)) {
    let rules = [];
    try {
      await politeWait();
      const res = await fetch(`${origin}/robots.txt`, { headers: { 'User-Agent': USER_AGENT } });
      if (res.ok) {
        let applies = false;
        for (const line of (await res.text()).split(/\r?\n/)) {
          const [key, ...rest] = line.replace(/#.*/, '').split(':');
          const value = rest.join(':').trim();
          if (/^user-agent$/i.test(key.trim())) applies = value === '*';
          else if (applies && /^disallow$/i.test(key.trim()) && value) rules.push(value);
        }
      }
    } catch {
      rules = [];
    }
    robotsCache.set(origin, rules);
  }
  return !robotsCache.get(origin).some((rule) => pathname.startsWith(rule));
}

let browser;
async function fetchHtml(url, render) {
  if (url.startsWith('fixture:')) {
    return fs.readFile(path.join(paths.fixtures, url.slice('fixture:'.length)), 'utf8');
  }
  if (!(await isAllowed(url))) throw new Error(`robots.txt により取得が禁止されています: ${url}`);
  await politeWait();

  if (render === 'browser') {
    if (!browser) {
      const { chromium } = await import('playwright').catch(() => {
        throw new Error('render: "browser" には Playwright が必要です（npm i -D playwright）');
      });
      browser = await chromium.launch();
    }
    const page = await browser.newPage({ userAgent: USER_AGENT });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      return await page.content();
    } finally {
      await page.close();
    }
  }

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ja' }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

// ---------- 解析 ----------

function extract($, el, spec, pageUrl) {
  const { selector, attr } = typeof spec === 'string' ? { selector: spec } : spec;
  const target = $(el).find(selector).first();
  if (target.length === 0) return null;
  const value = attr ? target.attr(attr) : target.text();
  if (!value) return null;
  // 相対リンクは絶対URLに解決（fixture の場合は解決しない）
  if (attr === 'href' && !pageUrl.startsWith('fixture:')) return new URL(value, pageUrl).href;
  return value;
}

async function scrapeSource(source) {
  const items = [];
  let url = source.url;
  for (let pageNo = 1; url && pageNo <= (source.maxPages ?? 1); pageNo++) {
    const $ = cheerio.load(await fetchHtml(url, source.render));
    $(source.list).each((_, el) => {
      const record = { category: source.category, ...source.defaults };
      for (const [field, spec] of Object.entries(source.fields)) {
        const value = extract($, el, spec, url);
        if (value === null) continue;
        // 'specs.monthlyFee' のようなキーは比較軸の値として specs に入れる（型変換は build-data で行う）
        if (field.startsWith('specs.')) (record.specs ??= {})[field.slice('specs.'.length)] = value;
        else record[field] = value;
      }
      items.push({ ...record, source: 'scrape', sourceUrl: url, fetchedAt: today() });
    });
    console.log(`  p.${pageNo} ${url} → 累計 ${items.length}件`);
    const next = source.next ? $(source.next).attr('href') : undefined;
    url = next ? (next.startsWith('fixture:') ? next : new URL(next, url).href) : undefined;
  }
  return items;
}

// ---------- 実行 ----------

const targets = args.source ? sources.filter((s) => s.name === args.source) : sources.filter((s) => s.enabled);
if (targets.length === 0) {
  console.log(args.source ? `ソース "${args.source}" が見つかりません。` : '有効なソースがありません（sources.config.mjs の enabled を確認）。');
  process.exit(args.source ? 1 : 0);
}

let failed = false;
try {
  for (const source of targets) {
    console.log(`▶ ${source.name}（${source.dataset}/${source.category}）`);
    try {
      const items = await scrapeSource(source);
      if (args['dry-run']) {
        console.log(JSON.stringify(items, null, 2));
      } else {
        const file = path.join(paths.raw[source.dataset], `${source.name}.json`);
        await writeJson(file, items);
        console.log(`✔ ${path.relative(paths.root, file)}: ${items.length}件`);
      }
    } catch (err) {
      failed = true;
      console.error(`✖ ${source.name}: ${err.message}`);
    }
  }
} finally {
  await browser?.close();
}
if (failed) process.exit(1);
