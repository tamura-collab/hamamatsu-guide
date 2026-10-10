/**
 * 都市ごとの設定。
 * 親ポータル「みんなの地域ガイド」配下に都市版をぶら下げる想定で、都市は citySlug で識別する。
 * 新しい都市を追加する場合はここにエントリを足し、環境変数 CITY=<citySlug> でビルドする。
 */
export interface CityConfig {
  /** 都市識別子（URL・ログ・データの切り替えに使用） */
  citySlug: string;
  /** 正式名称（例: 浜松市） */
  name: string;
  /** 短縮名（例: 浜松）。サイト名や見出しに使用 */
  shortName: string;
  /** ローマ字表記（ロゴのサブテキスト等） */
  nameEn: string;
  prefecture: string;
  /** ISO 3166-2 の地域コード（meta geo.region 用） */
  isoRegion: string;
  population: string;
  /** 代表駅（CTAのマイクロコピー等に使用） */
  mainStation: string;
  /** ヒーローのキャッチコピー（改行は \n） */
  catchCopy: string;
  /** ヒーロー下の説明文 */
  lead: string;
}

export const cities = {
  hamamatsu: {
    citySlug: 'hamamatsu',
    name: '浜松市',
    shortName: '浜松',
    nameEn: 'HAMAMATSU',
    prefecture: '静岡県',
    isoRegion: 'JP-22',
    population: '約78万人',
    mainStation: '浜松駅',
    catchCopy: '暮らすも、訪れるも。\n浜松のことなら、ここで比べて決める。',
    lead: '車移動が中心の浜松だからこそ、駐車場やバイパスからの行きやすさまで。地元編集部が条件をそろえて比較します。',
  },
} as const satisfies Record<string, CityConfig>;

export type CitySlug = keyof typeof cities;
