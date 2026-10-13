import fs from 'node:fs';
import path from 'node:path';
import type { Article } from '@/data/articles';

/**
 * 記事の画像が public/ に実在する場合だけ返す（ビルド時に判定）。
 * 画像ファイルが未配置の記事は null を返し、カードはカテゴリアイコン表示のままにする。
 */
export function articleImage(article: Article): { src: string; alt: string; credit?: Article['imageCredit'] } | null {
  if (!article.imageUrl) return null;
  const file = path.join(process.cwd(), 'public', article.imageUrl);
  if (!fs.existsSync(file)) return null;
  return { src: article.imageUrl, alt: article.imageAlt ?? '', credit: article.imageCredit };
}
