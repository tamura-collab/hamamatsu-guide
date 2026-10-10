import type { SectionKey } from './categories';

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  section: SectionKey;
  /** 関連カテゴリの slug */
  category: string;
  publishedAt: string; // YYYY-MM-DD
  readingMinutes: number;
  /** PR（広告）を含む記事か。景表法対応として一覧上にも表示する */
  isPr?: boolean;
  featured?: boolean;
}

// モック記事データ。将来的には Content Collections（src/content）や CMS へ置き換える想定。
export const articles: Article[] = [
  {
    slug: 'fiber-comparison-2026',
    title: '【2026年版】浜松市で使える光回線5社を徹底比較｜エリア・速度・料金',
    excerpt: '中央区・浜名区・天竜区の提供エリアの確認方法と、マンション・戸建て別の選び方をまとめました。',
    section: 'living',
    category: 'fiber',
    publishedAt: '2026-10-08',
    readingMinutes: 8,
    isPr: true,
    featured: true,
  },
  {
    slug: 'rainy-day-kids-spots',
    title: '雨の日でも子どもが飽きない！浜松の屋内スポット10選',
    excerpt: '無料で遊べる児童館から、浜松駅近くの科学館まで。車で行きやすい駐車場情報つき。',
    section: 'travel',
    category: 'rainy-day',
    publishedAt: '2026-10-06',
    readingMinutes: 6,
    featured: true,
  },
  {
    slug: '24h-gym-guide',
    title: '24時間ジムはどこがいい？浜松駅周辺と郊外の12店舗を月額で比較',
    excerpt: '仕事帰りに通いやすい浜松駅周辺の店舗と、浜松バイパス沿いの駐車場が広い店舗を分けて紹介。',
    section: 'living',
    category: 'gym',
    publishedAt: '2026-10-03',
    readingMinutes: 7,
    isPr: true,
  },
  {
    slug: 'night-bus-tokyo',
    title: '浜松⇔東京の夜行バス完全ガイド｜3列シートの快適な便はどれ？',
    excerpt: '浜松駅の乗り場の行き方、女性専用席の有無、新幹線との費用比較まで。',
    section: 'travel',
    category: 'night-bus',
    publishedAt: '2026-09-29',
    readingMinutes: 9,
  },
  {
    slug: 'car-buyback-tips',
    title: '車を高く売るには？浜松の買取店と一括査定の違いを比較',
    excerpt: '査定額が変わりやすいポイントと、手間と金額のバランスを解説します。',
    section: 'living',
    category: 'car-buyback',
    publishedAt: '2026-09-25',
    readingMinutes: 10,
    isPr: true,
  },
  {
    slug: 'station-hotels',
    title: '浜松駅から徒歩5分以内のビジネスホテル8選｜出張・観光の拠点に',
    excerpt: '大浴場あり・朝食が評判・連泊割など、目的別に選べるよう整理しました。',
    section: 'travel',
    category: 'hotel',
    publishedAt: '2026-09-20',
    readingMinutes: 5,
  },
];

export const sortedArticles = [...articles].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

export const formatDate = (iso: string) => iso.replaceAll('-', '.');
