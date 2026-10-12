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
    summary: '一括査定・廃車買取・実店舗の車買取サービスを、査定方法と手間で比較',
    icon: 'car',
    axes: [
      { key: 'kind', label: '種類', type: 'text', primary: true },
      { key: 'assessmentFee', label: '査定料', type: 'price', primary: true },
      { key: 'maxCompanies', label: '一括査定の依頼先', type: 'number', unit: '社まで', sort: 'desc', sortLabel: '依頼先が多い順' },
      { key: 'homeVisit', label: '出張査定', type: 'boolean', filter: 'yes', filterLabel: '出張査定あり' },
      { key: 'onlineApply', label: 'Web申込', type: 'boolean', filter: 'yes', filterLabel: 'Webで申込める' },
      { key: 'noReduction', label: '契約後の減額なし', type: 'boolean', filter: 'yes', filterLabel: '契約後の減額なしを明示' },
      { key: 'scrapOk', label: '廃車・事故車の買取', type: 'boolean', filter: 'yes', filterLabel: '廃車・事故車も買取' },
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
    slug: 'internet',
    section: 'living',
    title: '光回線・インターネット',
    summary: '浜松市で使える光回線とホームルーターを、月額・速度・スマホセット割で比較',
    icon: 'wifi',
    axes: [
      { key: 'lineType', label: 'サービス種別', type: 'text', primary: true },
      { key: 'feeHouse', label: '戸建て月額（目安）', type: 'price', sort: 'asc', sortLabel: '戸建ての月額が安い順', primary: true },
      { key: 'feeMansion', label: 'マンション月額（目安）', type: 'price', sort: 'asc', sortLabel: 'マンションの月額が安い順', primary: true },
      { key: 'maxSpeedGbps', label: '最大通信速度（理論値）', type: 'number', unit: 'Gbps', sort: 'desc', sortLabel: '最大速度が速い順' },
      { key: 'setDiscount', label: 'スマホセット割', type: 'text' },
      { key: 'setAu', label: 'au・UQ mobile割', type: 'boolean', filter: 'yes', filterLabel: 'au・UQ mobileのセット割' },
      { key: 'setDocomo', label: 'ドコモ割', type: 'boolean', filter: 'yes', filterLabel: 'ドコモのセット割' },
      { key: 'setSoftbank', label: 'SoftBank・Y!mobile割', type: 'boolean', filter: 'yes', filterLabel: 'SoftBank・Y!mobileのセット割' },
      { key: 'noConstruction', label: '開通工事不要', type: 'boolean', filter: 'yes', filterLabel: '開通工事不要' },
      { key: 'contract', label: '契約期間', type: 'text' },
    ],
    cta: { label: '提供エリアを確認する', microcopy: '住所を入れるだけで対応状況がわかります' },
    notice: '※掲載料金は戸建て・マンションやプロバイダ、キャンペーン適用により異なります。最新情報は公式サイトでご確認ください',
  },
  {
    slug: 'energy',
    section: 'living',
    title: '電気・ガス',
    summary: '中部電力エリアで選べる電力会社と、浜松市の都市ガス会社を料金体系・セット割で比較',
    icon: 'bolt',
    axes: [
      { key: 'kind', label: '種類', type: 'text', primary: true },
      { key: 'supplyArea', label: '供給エリア', type: 'text', primary: true },
      { key: 'pricing', label: '料金体系', type: 'text', primary: true },
      { key: 'basicFee', label: '基本料金', type: 'text' },
      { key: 'marketLinked', label: '市場連動型', type: 'boolean', filter: 'yes', filterLabel: '市場連動型' },
      { key: 'points', label: 'ポイント還元', type: 'text' },
      { key: 'setGas', label: 'ガスとのセット', type: 'boolean', filter: 'yes', filterLabel: 'ガスとセットにできる' },
      { key: 'setAu', label: 'au・UQ mobile', type: 'boolean', filter: 'yes', filterLabel: 'au・UQ mobile向け' },
      { key: 'setDocomo', label: 'ドコモ', type: 'boolean', filter: 'yes', filterLabel: 'ドコモ向け' },
      { key: 'setSoftbank', label: 'SoftBank・Y!mobile', type: 'boolean', filter: 'yes', filterLabel: 'SoftBank・Y!mobile向け' },
    ],
    cta: { label: '料金をシミュレーションする', microcopy: '今の明細と比べてみましょう' },
    notice: '※電気料金は燃料費調整額や再エネ賦課金、市場価格により毎月変動します。最新の料金単価は公式サイトのシミュレーション等でご確認ください',
  },
  {
    slug: 'moving',
    section: 'living',
    title: '引越し・不用品回収',
    summary: '浜松市対応の引越し業者・一括見積もりと、市の粗大ごみ（連絡ごみ）の出し方を比較',
    icon: 'truck',
    axes: [
      { key: 'kind', label: 'サービス種別', type: 'text', primary: true },
      { key: 'estimateFee', label: '見積もり', type: 'price', primary: true },
      { key: 'disposalFee', label: '処理手数料・1点（目安）', type: 'price', sort: 'asc', sortLabel: '処理手数料が安い順' },
      { key: 'estimateMethod', label: '見積もり・申込方法', type: 'text', primary: true },
      { key: 'single', label: '単身向け', type: 'boolean', filter: 'yes', filterLabel: '単身向け' },
      { key: 'family', label: 'ファミリー向け', type: 'boolean', filter: 'yes', filterLabel: 'ファミリー向け' },
      { key: 'disposal', label: '不用品の処分', type: 'boolean', filter: 'yes', filterLabel: '不用品・粗大ごみを処分できる' },
      { key: 'freeBoxes', label: 'ダンボール無料', type: 'boolean', filter: 'yes', filterLabel: 'ダンボール無料' },
    ],
    cta: { label: '無料で見積もる', microcopy: '繁忙期は早めの見積もりがおすすめ' },
    notice: '※実際の引越し費用は時期（3・4月繁忙期等）や荷物量、移動距離により大きく変動します。最新の見積もりは公式サイト（無料見積もり）でご確認ください',
  },
  // ---- 訪れる ----
  {
    slug: 'car-rental',
    section: 'travel',
    title: 'レンタカー',
    summary: '浜松駅周辺のレンタカー・カーシェアを、料金の目安・駅からの距離・乗り捨てで比較',
    icon: 'key',
    badge: '人気',
    axes: [
      { key: 'kind', label: 'サービス種別', type: 'text', primary: true },
      { key: 'halfDayFee', label: '半日・12時間まで（目安）', type: 'price', sort: 'asc', sortLabel: '半日料金が安い順', primary: true },
      { key: 'dayFee', label: '1日・24時間（目安）', type: 'price', sort: 'asc', sortLabel: '1日料金が安い順' },
      { ...AXIS.stationWalk, label: '浜松駅から徒歩' },
      { key: 'insurance', label: '免責補償', type: 'text' },
      { key: 'oneWay', label: '乗り捨て', type: 'boolean', filter: 'yes', filterLabel: '乗り捨て可' },
      { key: 'openHours', label: '営業時間', type: 'text', primary: true },
      { key: 'open24h', label: '24時間利用', type: 'boolean', filter: 'yes', filterLabel: '24時間利用可' },
    ],
    cta: { label: '空車と料金を確認する', microcopy: '{station}周辺で受け取りできるプランも' },
    notice: '※掲載料金は一般的なコンパクトカー等の目安です。時期（ハイシーズン等）や車種により異なりますので、最新料金は公式サイトでご確認ください',
  },
  {
    slug: 'hotel',
    section: 'travel',
    title: 'ホテル・宿泊',
    summary: '浜松駅周辺のホテルと舘山寺温泉の宿、宿泊予約サイトを、アクセス・駐車場・温泉で比較',
    icon: 'bed',
    axes: [
      { key: 'kind', label: '種類', type: 'text', primary: true },
      { key: 'accessInfo', label: '浜松駅からのアクセス', type: 'text', primary: true },
      { ...AXIS.stationWalk, label: '浜松駅から徒歩' },
      { key: 'parkingInfo', label: '駐車場', type: 'text', primary: true },
      { key: 'parking', label: '駐車場あり', type: 'boolean', filter: 'yes', filterLabel: '駐車場あり' },
      { key: 'onsen', label: '温泉・大浴場', type: 'boolean', filter: 'yes', filterLabel: '温泉・大浴場あり' },
      { key: 'points', label: 'ポイント', type: 'text' },
    ],
    cta: { label: '{station}周辺の空室を見る', microcopy: '連休・イベント時は早めの予約が安心' },
    notice: '※宿泊料金は時期・曜日・プラン・人数により大きく変動します。最新の料金・空室は公式サイトまたは予約サイトでご確認ください',
  },
  {
    slug: 'rainy-day',
    section: 'travel',
    title: '雨の日スポット',
    summary: '浜松市内の雨の日でも楽しめる屋内施設を、入館料・駅からのアクセス・予約の要否で比較',
    icon: 'umbrella',
    badge: '特集',
    axes: [
      { key: 'kind', label: '施設タイプ', type: 'text', primary: true },
      { key: 'admission', label: '入館料（大人・目安）', type: 'price', sort: 'asc', sortLabel: '入館料が安い順', primary: true },
      { key: 'accessInfo', label: '浜松駅からのアクセス', type: 'text' },
      { ...AXIS.stationWalk, label: '浜松駅から徒歩' },
      { key: 'rainAccess', label: '雨天時の移動', type: 'text' },
      AXIS.parking,
      { key: 'reservation', label: '事前予約', type: 'text', primary: true },
      { key: 'noReservation', label: '予約不要', type: 'boolean', filter: 'yes', filterLabel: '予約なしで行ける' },
    ],
    cta: { label: '営業時間・チケットを確認する', microcopy: '休館日はお出かけ前にチェック' },
    notice: '※掲載料金は一般的な大人料金の目安です。高校生・小中学生・プラネタリウム観覧等で異なりますので、最新情報は公式サイトでご確認ください',
  },
  {
    slug: 'express-bus',
    section: 'travel',
    title: '夜行バス・高速バス',
    summary: '浜松発着の高速バス・夜行バスと予約サイトを、運賃の目安・行き先・乗車場所で比較',
    icon: 'bus',
    axes: [
      { key: 'kind', label: 'サービス種別', type: 'text', primary: true },
      { key: 'fareTokyo', label: '片道目安（東京・新宿方面）', type: 'price', sort: 'asc', sortLabel: '東京方面が安い順', primary: true },
      { key: 'destinations', label: '主な行き先', type: 'text', primary: true },
      { key: 'boarding', label: '浜松の乗車場所', type: 'text' },
      { key: 'seatType', label: 'シート', type: 'text' },
      { key: 'toilet', label: 'トイレ付き', type: 'boolean', filter: 'yes', filterLabel: 'トイレ付き車両' },
      { key: 'night', label: '夜行便', type: 'boolean', filter: 'yes', filterLabel: '夜行便あり' },
    ],
    cta: { label: '空席を確認する', microcopy: '週末便は売り切れが早めです' },
    notice: '※掲載料金は一般的な大人片道運賃の目安です。乗車日（平日・土日祝・繁忙期）やシートタイプ、購入時期により大きく異なりますので、最新料金は公式サイト（予約サイト）でご確認ください',
  },
  {
    slug: 'gourmet',
    section: 'travel',
    title: 'ご当地グルメ',
    summary: '浜松餃子・うなぎ・さわやか・浜松ホルモンと、グルメ予約サイトを駅からのアクセスで比較',
    icon: 'utensils',
    axes: [
      { key: 'dishType', label: '名物ジャンル', type: 'text', primary: true },
      { key: 'budgetLunch', label: 'ランチ予算（目安）', type: 'price', sort: 'asc', sortLabel: 'ランチ予算が安い順', primary: true },
      { key: 'budgetDinner', label: 'ディナー予算（目安）', type: 'price', sort: 'asc', sortLabel: 'ディナー予算が安い順' },
      { key: 'accessInfo', label: '浜松駅からのアクセス', type: 'text', primary: true },
      { ...AXIS.stationWalk, label: '浜松駅から徒歩' },
      { key: 'takeout', label: 'テイクアウト', type: 'boolean', filter: 'yes', filterLabel: 'テイクアウト可' },
      { key: 'netReservation', label: 'ネット予約', type: 'boolean', filter: 'yes', filterLabel: 'ネット予約可' },
      AXIS.parking,
    ],
    cta: { label: '予約・空席を確認する', microcopy: '人気店は週末の予約がおすすめ' },
    notice: '※掲載料金は一般的な飲食時の目安です。注文メニューや時期により異なりますので、最新情報は店舗の公式情報や予約サイトでご確認ください',
  },
  {
    slug: 'parking',
    section: 'travel',
    title: '駐車場',
    summary: '浜松駅周辺・浜松城公園の駐車場と予約サービスを、最大料金目安と駅からのアクセスで比較',
    icon: 'parking',
    axes: [
      { key: 'kind', label: 'タイプ', type: 'text', primary: true },
      { key: 'maxWeekday', label: '最大料金目安（平日）', type: 'price', sort: 'asc', sortLabel: '平日の最大料金が安い順', primary: true },
      { key: 'maxWeekend', label: '最大料金目安（土日祝）', type: 'price', sort: 'asc', sortLabel: '土日祝の最大料金が安い順' },
      { key: 'capacity', label: '収容台数', type: 'number', unit: '台', sort: 'desc', sortLabel: '台数が多い順' },
      { key: 'accessInfo', label: '浜松駅からのアクセス', type: 'text', primary: true },
      { ...AXIS.stationWalk, label: '浜松駅から徒歩' },
      { key: 'open24h', label: '24時間入出庫', type: 'boolean', filter: 'yes', filterLabel: '24時間入出庫可' },
      { key: 'reservable', label: '事前予約', type: 'boolean', filter: 'yes', filterLabel: '事前予約可' },
    ],
    cta: { label: '料金・空き状況を見る', microcopy: 'イベント開催日は早めに満車になります' },
    notice: '※掲載料金・最大料金は適用条件（平日・土日祝・入庫後時間等）や時期により異なります。最新の料金や空き状況は現地看板または公式サイトでご確認ください',
  },
];

export const getCategoriesBySection = (section: SectionKey) =>
  categories.filter((c) => c.section === section);

export const getCategoryHref = (c: Pick<Category, 'section' | 'slug'>) =>
  `/${c.section}/${c.slug}`;
