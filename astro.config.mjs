// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import seoFiles from './integrations/seo-files.mjs';

// サイトURLは環境変数で切り替える（ドメイン非依存）。
//   ローカル:         未設定 → http://localhost:4321
//   Vercel / Netlify: SITE_URL 未設定なら各サービスの本番URL（VERCEL_PROJECT_PRODUCTION_URL / URL）を利用
//   Cloudflare Pages: SITE_URL を設定する
//   独自ドメイン移行: SITE_URL=https://example.jp を設定するだけでOK
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;
const netlifyUrl = process.env.NETLIFY ? process.env.URL : undefined;
const site = process.env.SITE_URL || vercelUrl || netlifyUrl || 'http://localhost:4321';

// サブディレクトリ配信が必要な場合のみ BASE_PATH=/media のように設定
const base = process.env.BASE_PATH || '/';

// プレビュー環境は検索エンジンにインデックスさせない（robots.txt を Disallow、全ページに noindex）。
// Vercel のプレビュー / Netlify のデプロイプレビュー・ブランチデプロイ /
// Cloudflare Pages の本番ブランチ（PRODUCTION_BRANCH、既定 main）以外を自動判定し、NOINDEX=true でも強制できる。
const cfPreview = !!process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== (process.env.PRODUCTION_BRANCH || 'main');
const noindex =
  process.env.NOINDEX === 'true' ||
  process.env.VERCEL_ENV === 'preview' ||
  ['deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT ?? '') ||
  cfPreview;
process.env.NOINDEX = String(noindex);

// 検索結果ページ・404 はサイトマップに含めない
const SITEMAP_EXCLUDE = [/\/search$/, /\/404$/];

export default defineConfig({
  site,
  base,
  // 完全な静的サイト（SSG）として出力する。サーバー処理は持たない
  output: 'static',
  // URL は末尾スラッシュなしに統一し、/about → about.html の形で出力する。
  // Vercel（cleanUrls）・Netlify・Cloudflare Pages のいずれでも追加設定なしで /about として配信される
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({ filter: (page) => !SITEMAP_EXCLUDE.some((re) => re.test(page.replace(/\/$/, ''))) }),
    seoFiles({ noindex }),
  ],
  env: {
    schema: {
      // 対象都市（src/config/cities.ts の citySlug）
      CITY: envField.string({ context: 'server', access: 'public', default: 'hamamatsu' }),
      // true のビルドは全ページ noindex（プレビュー環境では上で自動設定される）
      NOINDEX: envField.boolean({ context: 'server', access: 'public', default: false }),
      // GA4 の測定ID。環境変数で上書きでき、空文字にすると GA4 タグを読み込まない
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', default: 'G-DDP1G874JS' }),
      // 送客ログの送信先（例: /api/log）。未設定なら送信しない
      PUBLIC_LOG_ENDPOINT: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
