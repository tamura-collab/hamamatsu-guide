/**
 * 店舗（暮らす）・スポット（訪れる）データ。
 * JSON は `npm run data:build` で生成される（手で編集しない。補正は data/enrichment.json へ）。
 * 項目定義は scripts/lib/schema.mjs と揃えること。
 */
import storesJson from './stores.json';
import spotsJson from './spots.json';
import type { IconName } from '@/components/ui/icons';
import type { SectionKey } from './categories';

export type LocalNoteType = 'station' | 'road' | 'car' | 'parking' | 'landmark' | 'tip';

/** 地域文脈メモ（例: 「みなと駅徒歩5分」「臨港バイパス沿い」） */
export interface LocalNote {
  type: LocalNoteType;
  text: string;
  /** auto: アクセス情報から自動抽出 / manual: 編集部が補足 */
  source: 'auto' | 'manual';
}

export interface Place {
  id: string;
  name: string;
  /** src/data/categories.ts の slug */
  category: string;
  genre: string;
  address: string;
  tel: string | null;
  hours: string | null;
  access: string | null;
  officialUrl: string | null;
  description: string | null;
  localNote: LocalNote[];
  source: 'mock' | 'scrape' | 'manual';
  /** 情報の確認日（YYYY-MM-DD） */
  updatedAt: string;
}

export const stores = storesJson as Place[];
export const spots = spotsJson as Place[];

const bySection: Record<SectionKey, Place[]> = { living: stores, travel: spots };

export const getPlaces = (section: SectionKey, category?: string) =>
  category ? bySection[section].filter((p) => p.category === category) : bySection[section];

export const getPlaceCount = (section: SectionKey, category: string) => getPlaces(section, category).length;

export const getPlaceHref = (section: SectionKey, place: Pick<Place, 'category' | 'id'>) =>
  `/${section}/${place.category}/${place.id}`;

export const localNoteMeta: Record<LocalNoteType, { label: string; icon: IconName }> = {
  station: { label: '最寄り駅', icon: 'train' },
  road: { label: '幹線道路', icon: 'road' },
  car: { label: '車でのアクセス', icon: 'car' },
  parking: { label: '駐車場', icon: 'parking' },
  landmark: { label: '目印', icon: 'mapPin' },
  tip: { label: '地元メモ', icon: 'info' },
};

/** 表示順: 移動手段に関わるメモを先に */
const NOTE_ORDER: LocalNoteType[] = ['station', 'road', 'car', 'parking', 'landmark', 'tip'];
export const sortLocalNotes = (notes: LocalNote[]) =>
  [...notes].sort((a, b) => NOTE_ORDER.indexOf(a.type) - NOTE_ORDER.indexOf(b.type));
