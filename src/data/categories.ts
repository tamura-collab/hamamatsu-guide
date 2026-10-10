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
  /** 比較ポイント（詳細ページのモック表示に使用） */
  points: string[];
}

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
    summary: '24時間ジム、公営ジム、パーソナルまで月額・設備で比較',
    icon: 'dumbbell',
    badge: '人気',
    points: ['月額料金', '営業時間', '駐車場の有無', '女性専用エリア'],
  },
  {
    slug: 'car-buyback',
    section: 'living',
    title: '車買取・売却',
    summary: '市内の買取店と一括査定サービスの査定額・手間を比較',
    icon: 'car',
    points: ['査定方法', '出張査定', '入金スピード', '対応エリア'],
  },
  {
    slug: 'kids-school',
    section: 'living',
    title: 'キッズスクール・習い事',
    summary: '英会話・プログラミング・スイミングなどを駅・料金で探す',
    icon: 'graduation',
    badge: '新着',
    points: ['対象年齢', '月謝', '送迎の有無', '体験レッスン'],
  },
  {
    slug: 'fiber',
    section: 'living',
    title: '光回線・インターネット',
    summary: 'エリア対応状況と実効速度、スマホセット割で比較',
    icon: 'wifi',
    points: ['月額料金', '提供エリア', '実効速度', 'キャンペーン'],
  },
  {
    slug: 'energy',
    section: 'living',
    title: '電気・ガス',
    summary: '地域電力と新電力のプランを、世帯人数別にシミュレーション',
    icon: 'bolt',
    points: ['基本料金', '従量単価', 'セット割', '解約金'],
  },
  {
    slug: 'moving',
    section: 'living',
    title: '引越し・不用品回収',
    summary: '市内・県外への引越し相場と、粗大ごみの出し方まとめ',
    icon: 'truck',
    points: ['料金相場', '繁忙期料金', '見積もり方法', '回収品目'],
  },
  // ---- 訪れる ----
  {
    slug: 'rental-car',
    section: 'travel',
    title: 'レンタカー',
    summary: '駅前・空港の営業所と料金、乗り捨て可否を比較',
    icon: 'key',
    badge: '人気',
    points: ['24時間料金', '営業所の場所', '乗り捨て', '禁煙車'],
  },
  {
    slug: 'hotel',
    section: 'travel',
    title: 'ホテル・宿泊',
    summary: 'ビジネスホテルから温泉旅館まで、エリア別に探す',
    icon: 'bed',
    points: ['1泊料金', '駅からの距離', '朝食', '大浴場'],
  },
  {
    slug: 'rainy-day',
    section: 'travel',
    title: '雨の日スポット',
    summary: '屋内で楽しめる博物館・商業施設・子ども向け施設',
    icon: 'umbrella',
    badge: '特集',
    points: ['入場料', '対象年齢', '駐車場', '滞在目安'],
  },
  {
    slug: 'night-bus',
    section: 'travel',
    title: '夜行バス・高速バス',
    summary: '東京・大阪方面の便と座席タイプ、乗り場を比較',
    icon: 'bus',
    points: ['運賃', '所要時間', '座席タイプ', '乗車場所'],
  },
  {
    slug: 'gourmet',
    section: 'travel',
    title: 'ご当地グルメ',
    summary: '地元で愛される名物と、駅近で入りやすいお店',
    icon: 'utensils',
    points: ['価格帯', '予約可否', '営業時間', '駅からの距離'],
  },
  {
    slug: 'parking',
    section: 'travel',
    title: '駐車場・パーク&ライド',
    summary: '中心市街地の駐車場料金と、公共交通への乗り継ぎ',
    icon: 'parking',
    points: ['最大料金', '収容台数', '営業時間', '駅からの距離'],
  },
];

export const getCategoriesBySection = (section: SectionKey) =>
  categories.filter((c) => c.section === section);

export const getCategoryHref = (c: Pick<Category, 'section' | 'slug'>) =>
  `/${c.section}/${c.slug}`;
