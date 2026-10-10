import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * データの流れ:
 *   data/raw/{stores,spots}/*.json   … 収集した生データ（モック生成 / スクレイピング結果）
 *   data/enrichment.json             … 人手で管理する補正・地域文脈（localNote）
 *        ↓ scripts/build-data.mjs（正規化・地域文脈付与・検証）
 *   src/data/{stores,spots}.json     … サイトが読み込む最終データ
 */
export const paths = {
  root,
  raw: {
    stores: path.join(root, 'data/raw/stores'),
    spots: path.join(root, 'data/raw/spots'),
  },
  enrichment: path.join(root, 'data/enrichment.json'),
  output: {
    stores: path.join(root, 'src/data/stores.json'),
    spots: path.join(root, 'src/data/spots.json'),
  },
  fixtures: path.join(root, 'scripts/fixtures'),
};

/** データセット名 → サイト上のセクション */
export const DATASETS = {
  stores: 'living',
  spots: 'travel',
};
