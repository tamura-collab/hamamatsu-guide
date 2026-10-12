import type { SectionKey } from './categories';

export interface ArticleSource {
  label: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  section: SectionKey;
  /** 関連カテゴリの slug */
  category: string;
  publishedAt: string; // YYYY-MM-DD
  /** 内容を最後に確認・更新した日 */
  updatedAt?: string; // YYYY-MM-DD
  readingMinutes: number;
  /** PR（広告）を含む記事か。景表法対応として一覧上にも表示する */
  isPr?: boolean;
  featured?: boolean;
  /** 記事の根拠にした主な公式情報 */
  sources?: ArticleSource[];
}

// 記事のメタデータ。本文は src/data/articles/<slug>.md に置き、記事ページで読み込む。
// 料金・アクセス等は data/raw/**/curated-*.json の実データと内容を合わせる。
export const articles: Article[] = [
  {
    slug: 'car-buying-guide',
    title: '浜松で車を高く売るなら？おすすめ車買取・一括査定サイト6選を徹底比較',
    excerpt: '一括査定と廃車・事故車に強い買取の違いから、MOTA・carview!・チョージン・ガリバー・カーネクスト・ソコカラの特徴まで分かりやすく比較します。',
    section: 'living',
    category: 'car-sell',
    publishedAt: '2026-10-12',
    updatedAt: '2026-10-12',
    readingMinutes: 7,
    isPr: true,
    sources: [
      { label: 'MOTA車買取', url: 'https://autoc-one.jp/ullo/' },
      { label: 'carview! 車買取相場', url: 'https://carview.yahoo.co.jp/kaitori/souba/' },
      { label: 'チョージン 提供開始のお知らせ', url: 'https://prtimes.jp/main/html/rd/p/000000183.000072123.html' },
      { label: 'ガリバー よくある質問（査定・売却）', url: 'https://221616.com/faq/satei/' },
      { label: 'カーネクスト 浜松市', url: 'https://carnext.jp/shizuoka/hamamatsushi/' },
      { label: 'ソコカラ 浜松市', url: 'https://www.hanamaru870.net/area/shizuoka/hamamatsushi/' },
    ],
  },
  {
    slug: 'hamamatsu-sightseeing-top5',
    title: '浜松の観光スポットおすすめランキングTOP5｜浜松城・楽器博物館・エアーパークほか',
    excerpt: '浜松城公園から工場見学まで、行きやすさ・料金・天候への強さ・浜松らしさで選んだ5か所を、アクセスと料金つきで紹介します。',
    section: 'travel',
    category: 'rainy-day',
    publishedAt: '2026-10-12',
    updatedAt: '2026-10-12',
    readingMinutes: 6,
    featured: true,
    sources: [
      { label: '浜松城公園 アクセス', url: 'https://www.entetsuassist-dms.com/hamamatsu-jyo/access/' },
      { label: '浜松市 浜松城（市資料）', url: 'https://www.city.hamamatsu.shizuoka.jp/documents/157405/mc.pdf' },
      { label: '浜松市楽器博物館', url: 'https://www.gakkihaku.jp/access/' },
      { label: '浜松科学館 みらいーら 利用案内', url: 'https://www.mirai-ra.jp/guide/' },
      { label: '航空自衛隊浜松広報館', url: 'https://www.mod.go.jp/asdf/airpark/guide/index.html' },
      { label: 'うなぎパイファクトリー', url: 'https://www.unagipai-factory.jp/' },
    ],
  },
  {
    slug: 'hamamatsu-tokyo-access',
    title: '浜松から東京へ安く・快適に行く方法｜高速バス・e-LineR・新幹線を比較',
    excerpt: '新幹線と、浜松駅から乗れる昼行・夜行の高速バスを、運賃・乗り場・快適さで整理しました。',
    section: 'travel',
    category: 'express-bus',
    publishedAt: '2026-10-11',
    updatedAt: '2026-10-11',
    readingMinutes: 6,
    featured: true,
    sources: [
      { label: '遠鉄高速バス e-LineR', url: 'https://www.e-liner.jp/' },
      { label: 'e-LineR よくある質問', url: 'https://www.e-liner.jp/faq/' },
      { label: 'JR東海バス 高速バス', url: 'https://www.jrtbinm.co.jp/mainbusroute/' },
      { label: 'WILLER EXPRESS', url: 'https://travel.willer.co.jp/wex/' },
      { label: 'JAMJAMライナー', url: 'https://jamjamliner.jp/' },
    ],
  },
  {
    slug: 'hamamatsu-internet-guide',
    title: '浜松市で使える光回線6社を徹底比較｜コミュファ光・NURO光・ドコモ光・ソフトバンク光・auひかり・おてがる光',
    excerpt: '静岡県ではauひかりの戸建てが使えないなど浜松ならではの事情と、スマホのセット割・契約期間から選ぶ方法をまとめました。',
    section: 'living',
    category: 'internet',
    publishedAt: '2026-10-11',
    updatedAt: '2026-10-12',
    readingMinutes: 6,
    sources: [
      { label: 'コミュファ光', url: 'https://www.commufa.jp/' },
      { label: 'NURO光', url: 'https://www.nuro.jp/hikari/' },
      { label: 'ドコモ光', url: 'https://www.docomo.ne.jp/internet/hikari/' },
      { label: 'ソフトバンク光', url: 'https://www.softbank.jp/internet/sbhikari/' },
      { label: 'auひかり', url: 'https://www.au.com/internet/' },
      { label: 'おてがる光', url: 'https://otegal.com/' },
    ],
  },
  {
    slug: 'hamamatsu-parking-pcoupon',
    title: '浜松駅周辺の駐車場料金比較と「Pクーポン」お得活用術',
    excerpt: '長時間・送迎・買い物・観光の目的別に、市営駐車場やコインパーキングの使い分けを解説します。',
    section: 'travel',
    category: 'parking',
    publishedAt: '2026-10-10',
    updatedAt: '2026-10-11',
    readingMinutes: 6,
    sources: [
      { label: '浜松市 市営駐車場', url: 'https://www.city.hamamatsu.shizuoka.jp/kotsu/traffic/shiei-p/index.html' },
      { label: '浜松市営 駅北駐車場', url: 'https://www.entetsuassist-dms.com/hamamatsu-parking/ekikita/' },
      { label: '浜松市営駐車場 料金案内', url: 'https://www.entetsuassist-dms.com/hamamatsu-parking/price/' },
      { label: '浜まちWEB（Pクーポン）', url: 'https://pcoupon.jp/' },
      { label: '遠鉄百貨店 アクセス・駐車場', url: 'https://www.endepa.com/access/' },
      { label: '浜松城公園 アクセス', url: 'https://www.entetsuassist-dms.com/hamamatsu-jyo/access/' },
    ],
  },
  {
    slug: 'hamamatsu-gym-guide',
    title: '浜松市の24時間ジム・公営ジム徹底比較｜初心者・コスパ重視の選び方',
    excerpt: 'chocoZAP・エニタイム・総合クラブ・パーソナル・公営トレーニング室を、料金と使い方で比較します。',
    section: 'living',
    category: 'gym',
    publishedAt: '2026-10-09',
    updatedAt: '2026-10-11',
    readingMinutes: 6,
    sources: [
      { label: 'chocoZAP', url: 'https://chocozap.jp/' },
      { label: 'エニタイムフィットネス', url: 'https://www.anytimefitness.co.jp/chubu/shizuoka/?city=hamamatsu' },
      { label: 'ホリデイスポーツクラブ 浜松店', url: 'https://www.holiday-sc.jp/shops/012-hamamatsu/' },
      { label: 'RIZAP 浜松店', url: 'https://www.rizap.jp/studios/studio020' },
      { label: '浜松アリーナ', url: 'https://hamamatsu-arena.jp/' },
    ],
  },
  {
    slug: 'hamamatsu-gourmet-map',
    title: '浜松餃子・うなぎの名店と名物グルメ完全マップ｜浜松駅から行きやすい店',
    excerpt: '石松餃子・八百徳・さわやか・浜松ホルモンを、予算・アクセス・混雑対策つきで紹介します。',
    section: 'travel',
    category: 'gourmet',
    publishedAt: '2026-10-08',
    updatedAt: '2026-10-11',
    readingMinutes: 6,
    sources: [
      { label: '石松餃子 JR浜松駅店', url: 'https://1402.jp/shop/hamamatsu.html' },
      { label: 'うなぎ 八百徳', url: 'https://www.unagiyaotoku.com/info.php' },
      { label: 'さわやか 浜松遠鉄店', url: 'https://www.genkotsu-hb.com/shop/detail/237' },
      { label: '食べログ Vポイント', url: 'https://tabelog.com/tpoint/guide' },
    ],
  },
];

export const sortedArticles = [...articles].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

export const formatDate = (iso: string) => iso.replaceAll('-', '.');
