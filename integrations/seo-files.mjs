// @ts-check
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * ビルド後に SEO 用の静的ファイルを仕上げる Astro インテグレーション。
 *
 *   - robots.txt   … public/robots.txt の {{SITE_URL}} を本番URLに置換。noindex ビルドでは全体を Disallow
 *   - sitemap.xml  … @astrojs/sitemap が出力する sitemap-index.xml の別名（/sitemap.xml を参照するツール向け）
 *
 * ドメインをファイルに直書きしないため、SITE_URL を変えて再ビルドするだけでドメイン移行できる。
 * @param {{ noindex: boolean }} options
 * @returns {import('astro').AstroIntegration}
 */
export default function seoFiles({ noindex }) {
  /** @type {string} */
  let siteRoot = '';
  return {
    name: 'seo-files',
    hooks: {
      'astro:config:done': ({ config }) => {
        const base = config.base.replace(/\/$/, '');
        siteRoot = `${(config.site ?? '').replace(/\/$/, '')}${base}`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);

        const robotsPath = `${out}robots.txt`;
        const robots = noindex
          ? '# プレビュー環境のため検索エンジンのクロールを禁止しています\nUser-agent: *\nDisallow: /\n'
          : (await fs.readFile(robotsPath, 'utf8')).replace(/^#.*\n/gm, '').replaceAll('{{SITE_URL}}', siteRoot);
        await fs.writeFile(robotsPath, robots.trimStart());

        try {
          await fs.copyFile(`${out}sitemap-index.xml`, `${out}sitemap.xml`);
        } catch {
          logger.warn('sitemap-index.xml が見つからないため sitemap.xml を作成できませんでした');
        }
        logger.info(`robots.txt / sitemap.xml を出力しました（${noindex ? 'noindex' : siteRoot}）`);
      },
    },
  };
}
