import type { IconName } from '@/components/ui/icons';

export type SectionKey = 'living' | 'travel';

export interface Category {
  slug: string;
  section: SectionKey;
  title: string;
  /** カード上の短い説明 */
  summary: string;
  icon: IconName;
  /** カード上のラベル（任意） */
  badge?: string;
  /** 比較軸（比較テーブル・ソート・フィルター・データ検証に使用） */
  axes: CompareAxis[];
  /** アフィリエイト導線のCTA（ボタン文言とマイクロコピー） */
  cta: CategoryCta;
  /**
   * 料金注記の上書き（例: 車買取の「実際の査定額は…」）。未指定なら site.config.ts の priceNotice。
   * 指定するとこのカテゴリの比較表・カード・詳細ページに常に表示する
   */
  notice?: string;
}

/**
 * 比較軸の定義。値は各データの specs[key] に入る。
 *   price   … 目安料金（円）。値は「下限のみ」の数値か、価格帯 [下限, 上限]。
 *             表示は「7,700円〜」「6,800〜12,000円」「無料」の形に統一（unit は使わない）
 *   number  … 数値。sort で並び順を指定
 *   boolean … あり / なし
 *   text    … 自由記述（ソート・フィルター対象外）
 */
export interface CompareAxis {
  key: string;
  label: string;
  type: 'price' | 'number' | 'boolean' | 'text';
  /** 表示単位（number 用。例: '分', '台'） */
  unit?: string;
  /** ソート方向。指定した軸だけ並び替えの選択肢に出る */
  sort?: 'asc' | 'desc';
  /** ソート選択肢の表示名（例: '月額が安い順'） */
  sortLabel?: string;
  /** boolean: 「ありのみ」で絞り込み / max: 指定値以下で絞り込み */
  filter?: 'yes' | 'max';
  /** filter: 'max' の選択肢 */
  filterOptions?: number[];
  /** フィルターの表示名（例: '無料体験あり'） */
  filterLabel?: string;
  /** カードにも表示する主要な軸 */
  primary?: boolean;
}

export interface CategoryCta {
  /** ボタン文言（例: '無料体験を予約する'） */
  label: string;
  /** ボタン上に添える一言 */
  microcopy: string;
}

/** 複数カテゴリで共通の比較軸。駅徒歩・駐車場はアクセス情報から build-data で自動算出される */
const AXIS = {
  stationWalk: {
    key: 'stationWalkMin',
    label: '駅徒歩',
    type: 'number',
    unit: '分',
    sort: 'asc',
    sortLabel: '駅から近い順',
    filter: 'max',
    filterOptions: [5, 10, 15],
    filterLabel: '駅徒歩',
  },
  parking: { key: 'parking', label: '駐車場', type: 'boolean', filter: 'yes', filterLabel: '駐車場あり' },
} as const satisfies Record<string, CompareAxis>;

export interface Section {
  key: SectionKey;
  label: string;
  labelEn: string;
  href: string;
  lead: string;
  icon: IconName;
}

export const sections: Record<SectionKey, Section> = {
  living: {
    key: 'living',
    label: '暮らす',
    labelEn: 'LIVING',
    href: '/living',
    lead: '毎月の固定費から子どもの習い事まで。地元の生活インフラを、条件をそろえて比較します。',
    icon: 'home',
  },
  travel: {
    key: 'travel',
    label: '訪れる',
    labelEn: 'TRAVEL',
    href: '/travel',
    lead: '出張でも観光でも。移動手段・宿・天気に左右されない過ごし方まで、地元目線でまとめました。',
    icon: 'compass',
  },
};

export const categories: Category[] = [
  // ---- 暮らす ----
  {
    slug: 'gym',
    section: 'living',
    title: 'ジム・フィットネス',
    summary: 'コンビニジム・24時間ジム・総合クラブ・パーソナル・公営施設を料金と設備で比較',
    icon: 'dumbbell',
    badge: '人気',
    axes: [
      { key: 'monthlyFee', label: '月額（目安）', type: 'price', sort: 'asc', sortLabel: '月額が安い順', primary: true },
      { key: 'perVisitFee', label: '都度利用・1回（目安）', type: 'price', sort: 'asc', sortLabel: '1回あたりが安い順' },
      { key: 'trial', label: '体験・無料相談', type: 'boolean', filter: 'yes', filterLabel: '体験・無料相談あり', primary: true },
      { key: 'open24h', label: '24時間', type: 'boolean', filter: 'yes', filterLabel: '24時間営業' },
      { key: 'womenOnly', label: '女性専用', type: 'boolean', filter: 'yes', filterLabel: '女性専用' },
      { key: 'personal', label: 'パーソナル指導', type: 'boolean', filter: 'yes', filterLabel: 'パーソナル指導あり' },
      { key: 'poolSauna', label: 'プール・サウナ', type: 'boolean', filter: 'yes', filterLabel: 'プール・サウナあり' },
      AXIS.stationWalk,
      AXIS.parking,
    ],
    cta: { label: '無料体験を予約する', microcopy: '入会前に設備と混雑具合をチェック' },
  },
  {
    slug: 'car-sell',
    section: 'living',
    title: '車買取・売却',
    summary: '浜松市内の買取店とWeb一括査定サービスを、査定方法と手間で比較',
    icon: 'car',
    axes: [
      { key: 'kind', label: '種類', type: 'text', primary: true },
      { key: 'assessmentFee', label: '査定料', type: 'price', primary: true },
      { key: 'maxCompanies', label: '一括査定の依頼先', type: 'number', unit: '社まで', sort: 'desc', sortLabel: '依頼先が多い順' },
      { key: 'homeVisit', label: '出張査定', type: 'boolean', filter: 'yes', filterLabel: '出張査定あり' },
      { key: 'onlineApply', label: 'Web申込', type: 'boolean', filter: 'yes', filterLabel: 'Webで申込める' },
      { key: 'noReduction', label: '契約後の減額なし', type: 'boolean', filter: 'yes', filterLabel: '契約後の減額なしを明示' },
    ],
    cta: { label: '無料査定を試す', microcopy: '査定額を見てから売るか決められます' },
    notice: '※実際の査定額は車の状態や時期により異なります。最新情報は公式サイトでご確認ください',
  },
  {
    slug: 'kids-school',
    section: 'living',
    title: 'キッズスクール・習い事',
    summary: 'ロボット・プログラミング・英会話・スイミング・体操教室を、月謝と対象年齢で比較',
    icon: 'graduation',
    badge: '新着',
    axes: [
      { key: 'field', label: 'ジャンル', type: 'text' },
      { key: 'monthlyFee', label: '月謝（目安）', type: 'price', sort: 'asc', sortLabel: '月謝が安い順', primary: true },
      { key: 'ageRange', label: '対象年齢', type: 'text', primary: true },
      { key: 'ageFrom', label: '何歳から', type: 'number', unit: '歳〜', sort: 'asc', sortLabel: '小さい子から通える順' },
      { key: 'trial', label: '体験レッスン', type: 'boolean', filter: 'yes', filterLabel: '体験レッスンあり', primary: true },
      { key: 'pickup', label: '送迎バス', type: 'boolean', filter: 'yes', filterLabel: '送迎バスあり' },
      AXIS.parking,
      AXIS.stationWalk,
    ],
    cta: { label: '体験レッスンを申し込む', microcopy: 'お子さまに合うか、まずは体験で' },
    notice: '※掲載料金は目安です。コースや学年により異なりますので、最新情報は公式サイトでご確認ください',
  },
  {
    slug: 'fiber',
    section: 'living',
    title: '光回線・インターネット',
    summary: 'エリア対応状況と実効速度、スマホセット割で比較',
    icon: 'wifi',
    axes: [
      { key: 'monthlyFee', label: '月額（目安）', type: 'price', sort: 'asc', sortLabel: '月額が安い順', primary: true },
      { key: 'maxSpeedGbps', label: '最大速度', type: 'number', unit: 'Gbps', sort: 'desc', sortLabel: '速度が速い順', primary: true },
      { key: 'consultation', label: '対面相談', type: 'boolean', filter: 'yes', filterLabel: '対面相談可' },
      AXIS.stationWalk,
      AXIS.parking,
    ],
    cta: { label: '提供エリアを確認する', microcopy: '住所を入れるだけで対応状況がわかります' },
  },
  {
    slug: 'energy',
    section: 'living',
    title: '電気・ガス',
    summary: '地域電力と新電力のプランを、世帯人数別にシミュレーション',
    icon: 'bolt',
    axes: [
      { key: 'simulation', label: '料金試算', type: 'boolean', filter: 'yes', filterLabel: '料金試算あり', primary: true },
      { key: 'setDiscount', label: 'セット割', type: 'boolean', filter: 'yes', filterLabel: 'セット割あり', primary: true },
      AXIS.stationWalk,
      AXIS.parking,
    ],
    cta: { label: '料金をシミュレーションする', microcopy: '今の明細と比べてみましょう' },
  },
  {
    slug: 'moving',
    section: 'living',
    title: '引越し・不用品回収',
    summary: '市内・県外への引越し相場と、粗大ごみの出し方まとめ',
    icon: 'truck',
    axes: [
      { key: 'onlineEstimate', label: 'Web見積もり', type: 'boolean', filter: 'yes', filterLabel: 'Web見積もり可', primary: true },
      { key: 'singlePlanFee', label: '単身プラン（目安）', type: 'price', sort: 'asc', sortLabel: '単身プランが安い順', primary: true },
      { key: 'disposal', label: '不用品回収', type: 'boolean', filter: 'yes', filterLabel: '不用品回収あり' },
    ],
    cta: { label: '無料で見積もる', microcopy: '繁忙期は早めの見積もりがおすすめ' },
  },
  // ---- 訪れる ----
  {
    slug: 'rental-car',
    section: 'travel',
    title: 'レンタカー',
    summary: '駅前・空港の営業所と料金、乗り捨て可否を比較',
    icon: 'key',
    badge: '人気',
    axes: [
      { key: 'price24h', label: '24時間料金（目安）', type: 'price', sort: 'asc', sortLabel: '料金が安い順', primary: true },
      { key: 'dropOff', label: '乗り捨て', type: 'boolean', filter: 'yes', filterLabel: '乗り捨て可', primary: true },
      { key: 'nonSmoking', label: '禁煙車', type: 'boolean', filter: 'yes', filterLabel: '禁煙車あり' },
      AXIS.stationWalk,
    ],
    cta: { label: '空車と料金を確認する', microcopy: '{station}周辺で受け取りできるプランも' },
  },
  {
    slug: 'hotel',
    section: 'travel',
    title: 'ホテル・宿泊',
    summary: 'ビジネスホテルから温泉旅館まで、エリア別に探す',
    icon: 'bed',
    axes: [
      { key: 'priceFrom', label: '1泊料金（目安）', type: 'price', sort: 'asc', sortLabel: '料金が安い順', primary: true },
      { key: 'breakfast', label: '朝食', type: 'boolean', filter: 'yes', filterLabel: '朝食あり', primary: true },
      { key: 'largeBath', label: '大浴場', type: 'boolean', filter: 'yes', filterLabel: '大浴場あり' },
      AXIS.stationWalk,
      AXIS.parking,
    ],
    cta: { label: '{station}周辺の空室を見る', microcopy: '連休・イベント時は早めの予約が安心' },
  },
  {
    slug: 'rainy-day',
    section: 'travel',
    title: '雨の日スポット',
    summary: '屋内で楽しめる博物館・商業施設・子ども向け施設',
    icon: 'umbrella',
    badge: '特集',
    axes: [
      { key: 'admission', label: '入場料・大人（目安）', type: 'price', sort: 'asc', sortLabel: '入場料が安い順', primary: true },
      { key: 'kidsFriendly', label: '子ども向け', type: 'boolean', filter: 'yes', filterLabel: '子ども向け', primary: true },
      { key: 'stayMinutes', label: '滞在目安', type: 'number', unit: '分', sort: 'desc', sortLabel: '長く過ごせる順' },
      AXIS.stationWalk,
      AXIS.parking,
    ],
    cta: { label: '営業時間・チケットを確認する', microcopy: '休館日はお出かけ前にチェック' },
  },
  {
    slug: 'night-bus',
    section: 'travel',
    title: '夜行バス・高速バス',
    summary: '東京・大阪方面の便と座席タイプ、乗り場を比較',
    icon: 'bus',
    axes: [
      { key: 'fareFrom', label: '運賃（目安）', type: 'price', sort: 'asc', sortLabel: '運賃が安い順', primary: true },
      { key: 'seatType', label: '座席', type: 'text', primary: true },
      { key: 'womenSeats', label: '女性専用席', type: 'boolean', filter: 'yes', filterLabel: '女性専用席あり' },
      AXIS.stationWalk,
    ],
    cta: { label: '空席を確認する', microcopy: '週末便は売り切れが早めです' },
  },
  {
    slug: 'gourmet',
    section: 'travel',
    title: 'ご当地グルメ',
    summary: '地元で愛される名物と、駅近で入りやすいお店',
    icon: 'utensils',
    axes: [
      { key: 'budget', label: '予算（目安）', type: 'price', sort: 'asc', sortLabel: '予算が安い順', primary: true },
      { key: 'reservation', label: '予約', type: 'boolean', filter: 'yes', filterLabel: '予約可', primary: true },
      AXIS.stationWalk,
      AXIS.parking,
    ],
    cta: { label: '予約・空席を確認する', microcopy: '人気店は週末の予約がおすすめ' },
  },
  {
    slug: 'parking',
    section: 'travel',
    title: '駐車場・パーク&ライド',
    summary: '中心市街地の駐車場料金と、公共交通への乗り継ぎ',
    icon: 'parking',
    axes: [
      { key: 'maxDaily', label: '最大料金/日（目安）', type: 'price', sort: 'asc', sortLabel: '最大料金が安い順', primary: true },
      { key: 'capacity', label: '収容台数', type: 'number', unit: '台', sort: 'desc', sortLabel: '台数が多い順', primary: true },
      { key: 'open24h', label: '24時間', type: 'boolean', filter: 'yes', filterLabel: '24時間営業' },
      AXIS.stationWalk,
    ],
    cta: { label: '料金・空き状況を見る', microcopy: 'イベント開催日は早めに満車になります' },
  },
];

export const getCategoriesBySection = (section: SectionKey) =>
  categories.filter((c) => c.section === section);

export const getCategoryHref = (c: Pick<Category, 'section' | 'slug'>) =>
  `/${c.section}/${c.slug}`;
