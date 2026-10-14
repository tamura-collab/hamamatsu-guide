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
  /** サムネイル・本文冒頭の画像（public/ からのパス）。ファイルがない間はアイコン表示 */
  imageUrl?: string;
  imageAlt?: string;
  /** 画像の出典（クレジット表記が必要な素材のみ） */
  imageCredit?: ArticleSource;
  /** 記事のタグ（関連記事・タグ一覧用） */
  tags?: string[];
}

// 記事のメタデータ。本文は src/data/articles/<slug>.md に置き、記事ページで読み込む。
// 料金・アクセス等は data/raw/**/curated-*.json の実データと内容を合わせる。
export const articles: Article[] = [
  {
    slug: 'hamamatsu-relocation-guide',
    title: '【2026年最新】浜松移住パーフェクトガイド｜おすすめの理由・注意点・助成金・子育て教育のリアル',
    excerpt: '浜松への移住を検討中の方へ。温暖な気候と製造業の求人、最大100万円超の移住支援金、子育て・学区事情から、「からっ風」「車2台持ち」などの注意点・後悔しない土地選びまで徹底解説します。',
    section: 'living',
    category: 'moving',
    publishedAt: '2026-10-14',
    updatedAt: '2026-10-14',
    readingMinutes: 9,
    isPr: false,
    tags: ['移住・転勤', '助成金', '子育て・教育', '住みやすさ', '浜松暮らし'],
    sources: [
      { label: '浜松市 はじめようハマライフ助成事業費補助金（移住・就業支援金）', url: 'https://www.city.hamamatsu.shizuoka.jp/hamalife/oshirase/ijushienkin2.html' },
      { label: '浜松市 まちなか定住促進・子育て応援環境づくり補助金', url: 'https://www.city.hamamatsu.shizuoka.jp/jutaku/matinaka_kosodate.html' },
      { label: '浜松市 住宅取得費等の補助（チラシ）', url: 'https://www.city.hamamatsu.shizuoka.jp/documents/113024/jyutakuhojyokin_tirasi.pdf' },
      { label: '浜松市 中山間地域空き家バンク', url: 'https://www.city.hamamatsu.shizuoka.jp/hamalife/eriasumai/akiyabanku.html' },
      { label: '浜松市 移住相談（浜松移住センター）', url: 'https://www.city.hamamatsu.shizuoka.jp/hamalife/madoguchi.html' },
    ],
  },
  {
    slug: 'hamamatsu-living-areas',
    title: '【2026年最新】浜松市で暮らすならどこ？新3区（中央区・浜名区・天竜区）の特徴と住みやすさガイド',
    excerpt: '2024年の行政区再編で誕生した浜松市「中央区」「浜名区」「天竜区」の特徴・住みやすさ・家賃相場を徹底比較。ライフスタイルや家族構成に応じたおすすめエリアを解説します。',
    section: 'living',
    category: 'moving',
    publishedAt: '2026-10-14',
    updatedAt: '2026-10-14',
    readingMinutes: 8,
    isPr: false,
    tags: ['移住・転勤', '住みやすさ', '中央区', '浜名区', '天竜区'],
    sources: [
      { label: '浜松市 行政区別人口（令和7年10月1日）', url: 'https://www.city.hamamatsu.shizuoka.jp/documents/172713/r07_gaiyou.pdf' },
      { label: 'アットホーム 浜松市中央区の家賃相場', url: 'https://www.athome.co.jp/chintai/souba/shizuoka/hamamatsu_chuo-city/' },
      { label: 'アットホーム 浜松市浜名区の賃貸物件', url: 'https://www.athome.co.jp/chintai/shizuoka/hamamatsu_hamana-city/list/' },
      { label: 'アットホーム 浜松市天竜区の家賃相場', url: 'https://www.athome.co.jp/chintai/souba/shizuoka/hamamatsu_tenryu-city/' },
    ],
  },
  {
    slug: 'hamamatsu-car-lifestyle',
    title: '浜松で『車なし』生活は可能？移住・転勤前に知っておくべき交通事情と維持費のリアル',
    excerpt: '浜松駅周辺や遠鉄電車の沿線なら車なしでも暮らせる一方、郊外は1人1台が基本。駐車場代を含む維持費と、車を手放す・買い替えるときの注意点をまとめました。',
    section: 'living',
    category: 'car-sell',
    publishedAt: '2026-10-13',
    updatedAt: '2026-10-13',
    imageUrl: '/images/articles/car-lifestyle.jpg',
    imageAlt: '電車が走る街並みのイメージ',
    readingMinutes: 7,
    isPr: false,
    sources: [
      { label: '浜松市 公共交通の案内', url: 'https://www.city.hamamatsu.shizuoka.jp/documents/39238/koukyoukoutsuukikan.pdf' },
      { label: '遠州鉄道を旅する（乗りものニュース）', url: 'https://trafficnews.jp/post/82556' },
      { label: '特P 月極駐車場（浜松市）', url: 'https://toku-p.earth-car.com/monthly-parking/parking-search/34.73657485-137.73307789-14/%E9%9D%99%E5%B2%A1%E7%9C%8C%E6%B5%9C%E6%9D%BE%E5%B8%82%E4%B8%AD%E5%8C%BA%E5%B9%B8%EF%BC%92%E4%B8%81%E7%9B%AE%EF%BC%95%EF%BC%92%E2%88%92%EF%BC%91%EF%BC%98/ranking-price' },
    ],
  },
  {
    slug: 'hamamatsu-no-car-trip',
    title: '新幹線から直行！車なし・公共交通機関で楽しむ浜松日帰り観光モデルコース',
    excerpt: '浜松駅を拠点に、バス・JR・遠鉄電車で浜松城公園、浜松餃子、浜名湖の弁天島やフルーツパークを巡る日帰りコースと、コインロッカー情報を紹介します。',
    section: 'travel',
    category: 'rainy-day',
    publishedAt: '2026-10-13',
    updatedAt: '2026-10-13',
    imageUrl: '/images/articles/hamamatsu-castle.jpg',
    imageAlt: '浜松城',
    readingMinutes: 7,
    isPr: false,
    sources: [
      { label: '浜松城公園 アクセス', url: 'https://www.entetsuassist-dms.com/hamamatsu-jyo/access/' },
      { label: '浜松市 茶室 松韻亭', url: 'https://www.city.hamamatsu.shizuoka.jp/bunka/culture_art/shointei/shointeichashitu.html' },
      { label: 'JR浜松駅から市内の観光地へ（浜松だいすきネット）', url: 'https://hamamatsu-daisuki.net/pickup/3108/' },
      { label: 'はままつフルーツパーク時之栖 アクセス（るるぶ&more.）', url: 'https://rurubu.jp/andmore/spot/80021930/' },
      { label: '石松餃子 JR浜松駅店', url: 'https://1402.jp/shop/hamamatsu.html' },
    ],
  },
  {
    slug: 'car-buying-guide',
    title: '浜松で車を高く売るなら？おすすめ車買取・一括査定サイト6選を徹底比較',
    excerpt: '一括査定と廃車・事故車に強い買取の違いから、MOTA・carview!・チョージン・ガリバー・カーネクスト・ソコカラの特徴まで分かりやすく比較します。',
    section: 'living',
    category: 'car-sell',
    publishedAt: '2026-10-12',
    updatedAt: '2026-10-12',
    imageUrl: '/images/articles/car-buying.jpg',
    imageAlt: '車のイメージ',
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
    imageUrl: '/images/articles/act-tower.jpg',
    imageAlt: '高層ビルが並ぶ街並みのイメージ',
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
    imageUrl: '/images/articles/highway-bus.jpg',
    imageAlt: '高速バスのイメージ',
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
    imageUrl: '/images/articles/internet.jpg',
    imageAlt: 'インターネット回線のイメージ',
    readingMinutes: 6,
    isPr: true,
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
    imageUrl: '/images/articles/parking.jpg',
    imageAlt: '駐車場のイメージ',
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
    imageUrl: '/images/articles/gym.jpg',
    imageAlt: 'トレーニングマシンが並ぶジムのイメージ',
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
