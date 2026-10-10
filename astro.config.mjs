// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// サイトURLは環境変数で切り替える（ドメイン非依存）。
//   ローカル:         未設定 → http://localhost:4321
//   Vercel:           SITE_URL 未設定なら VERCEL_PROJECT_PRODUCTION_URL を利用
//   独自ドメイン移行: SITE_URL=https://example.jp を設定するだけでOK
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;
const site = process.env.SITE_URL || vercelUrl || 'http://localhost:4321';

// サブディレクトリ配信が必要な場合のみ BASE_PATH=/media のように設定
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
