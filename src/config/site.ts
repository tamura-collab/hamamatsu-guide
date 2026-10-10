/**
 * サイト全体の設定。
 * 別の都市で展開する場合や独自ドメインへ移行する場合は、このファイルと
 * 環境変数（SITE_URL / BASE_PATH）を変更するだけで済むようにしている。
 * URL はコード中にハードコードせず、`lib/url.ts` の `url()` を経由して生成すること。
 */
export const siteConfig = {
  /** サイト名（ロゴ・titleに使用） */
  siteName: 'みなとまちガイド',
  /** 英字の短縮名（ロゴ下のサブテキスト等） */
  siteNameEn: 'MINATO LOCAL GUIDE',
  /** 対象都市（モック用の架空都市。展開先に合わせて変更） */
  city: {
    name: 'みなと市',
    prefecture: '〇〇県',
    population: '約48万人',
  },
  catchCopy: '暮らすも、訪れるも。\nみなと市のことなら、ここで比べて決める。',
  description:
    'みなと市の「暮らし」と「おでかけ」をまとめた地域特化メディア。ジム・光回線・車買取などの生活インフラ比較から、レンタカー・ホテル・雨の日スポットまで、地元目線で分かりやすく紹介します。',
  /** 運営者情報（フッター・各ポリシーページで使用） */
  operator: {
    name: 'みなとまちガイド編集部',
    contactEmail: 'info@example.com',
  },
  /** 景表法（ステマ規制）対応の関係性表記 */
  prDisclosure:
    '※当サイトはアフィリエイトプログラムを利用しており、記事内に広告・PRを含みます。',
  locale: 'ja_JP',
  lang: 'ja',
} as const;

export type SiteConfig = typeof siteConfig;
