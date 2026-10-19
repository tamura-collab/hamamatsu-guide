/**
 * IndexNow 通知（Bing などの検索エンジンに更新URLを知らせる）。
 *
 * astro build の後に実行し、dist/ のサイトマップに載っているURLを
 * https://api.indexnow.org/indexnow へ一括送信する。
 *
 * - 送信するのは本番ビルドだけ（Vercel の VERCEL_ENV=production、または INDEXNOW_FORCE=true）。
 *   プレビュー・noindex ビルド・localhost では送信せず、送る予定の内容だけ表示する
 * - INDEXNOW_DRY_RUN=true で本番でも送信せずに内容だけ表示する
 * - 通知に失敗してもビルドは失敗させない（終了コードは常に 0）
 * - キーは public/<キー>.txt に置き、https://<ドメイン>/<キー>.txt で検証される
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.INDEXNOW_KEY || '1f593cd4c53d0f778446203976466481';
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow'; // テスト時のみ上書き
const DIST = path.resolve('dist');
const MAX_URLS = 10000; // IndexNow の1リクエストあたりの上限

const log = (msg) => console.log(`[indexnow] ${msg}`);

/** サイトマップ（インデックス／個別）から <loc> の値を取り出す */
const extractLocs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replaceAll('&amp;', '&'));

/** sitemap-index.xml から個別サイトマップをたどり、ページURLを集める */
async function collectUrls() {
  const index = await fs.readFile(path.join(DIST, 'sitemap-index.xml'), 'utf8');
  const urls = [];
  for (const sitemapUrl of extractLocs(index)) {
    const file = path.join(DIST, path.basename(new URL(sitemapUrl).pathname));
    urls.push(...extractLocs(await fs.readFile(file, 'utf8')));
  }
  return [...new Set(urls)];
}

async function main() {
  let urls;
  try {
    urls = await collectUrls();
  } catch (err) {
    log(`サイトマップを読み込めないため通知をスキップします（${err.message}）`);
    return;
  }
  if (urls.length === 0) return log('通知するURLがないためスキップします');

  const { host, hostname, origin } = new URL(urls[0]);
  const body = { host, key: KEY, keyLocation: `${origin}/${KEY}.txt`, urlList: urls.slice(0, MAX_URLS) };

  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.INDEXNOW_FORCE === 'true';
  const skipReason =
    process.env.NOINDEX === 'true' ? 'noindex ビルド'
    : /^(localhost|127\.0\.0\.1)$/.test(hostname) ? 'ローカルのURL'
    : !isProduction ? '本番以外のビルド'
    : process.env.INDEXNOW_DRY_RUN === 'true' ? 'INDEXNOW_DRY_RUN=true'
    : null;

  if (skipReason) {
    log(`${skipReason}のため送信しません（ドライラン）: host=${host} / ${body.urlList.length}件 / keyLocation=${body.keyLocation}`);
    body.urlList.slice(0, 3).forEach((u) => log(`  例: ${u}`));
    return;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    // 200: 受理 / 202: 受理（キー検証は後で実施）。それ以外は警告のみ
    if (res.ok) log(`${body.urlList.length}件のURLを通知しました（HTTP ${res.status}, host=${host}）`);
    else log(`通知に失敗しました（HTTP ${res.status}）: ${(await res.text()).slice(0, 200)}`);
  } catch (err) {
    log(`通知に失敗しました（${err.message}）。ビルドは続行します`);
  }
}

await main();
