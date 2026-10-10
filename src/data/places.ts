/**
 * 店舗（暮らす）・スポット（訪れる）データ。
 * JSON は `npm run data:build` で生成される（手で編集しない。補正は data/enrichment.json へ）。
 * 項目定義は scripts/lib/schema.mjs と揃えること。
 */
import storesJson from './stores.json';
import spotsJson from './spots.json';
import type { IconName } from '@/components/ui/icons';
import type { CompareAxis, SectionKey } from './categories';

export type LocalNoteType = 'station' | 'road' | 'car' | 'parking' | 'landmark' | 'tip';

/** 地域文脈メモ（例: 「浜松駅徒歩5分」「浜松バイパス沿い」） */
export interface LocalNote {
  type: LocalNoteType;
  text: string;
  /** auto: アクセス情報から自動抽出 / manual: 編集部が補足 */
  source: 'auto' | 'manual';
}

/** 比較軸の値。price は下限のみの数値、または価格帯 [下限, 上限] */
export type SpecValue = number | [number, number] | boolean | string | null;

export interface Affiliate {
  url: string;
  /** CTAボタン文言の上書き（未設定時はカテゴリの cta.label） */
  label: string | null;
  /** 提携先（ASP名など。社内管理用） */
  program: string | null;
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
  /** 比較軸の値（キーは categories.ts の axes[].key）。不明な値は null */
  specs: Record<string, SpecValue>;
  /** 特徴タグ（例: 「24時間営業」「着替え不要」） */
  features: string[];
  /** 店舗固有の料金注記（例: 「コース制のため月額表示なし」）。共通の料金注記とあわせて表示する */
  priceNote: string | null;
  /** 複数店舗をまとめた掲載か（住所は代表店舗またはエリア表記） */
  chain: boolean;
  /** store: 実店舗 / online: Web完結のサービス（地図ボタン・店舗の構造化データを出さない） */
  serviceType: 'store' | 'online';
  /** アフィリエイト（広告）リンク。提携がある場合のみ設定される */
  affiliate: Affiliate | null;
  source: 'mock' | 'scrape' | 'manual';
  /** 情報の確認日（YYYY-MM-DD） */
  updatedAt: string;
}

// JSON の推論型は行ごとに specs の形が異なるため unknown 経由で変換する（内容は data:build で検証済み）
export const stores = storesJson as unknown as Place[];
export const spots = spotsJson as unknown as Place[];

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

/** 並び替え・最安判定用の数値（価格帯は下限を使う） */
export function specNumber(value: SpecValue | undefined): number | null {
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return value[0];
  return null;
}

const yen = (n: number) => n.toLocaleString('ja-JP');

/**
 * 比較軸の値を表示用の文字列にする。
 * 料金は目安として「7,700円〜」（下限のみ）/「6,800〜12,000円」（価格帯）/「無料」に統一する。
 */
export function formatSpec(axis: CompareAxis, value: SpecValue | undefined): string {
  if (value === null || value === undefined) return '—';
  if (axis.type === 'boolean') return value ? 'あり' : 'なし';
  if (axis.type === 'price') {
    if (Array.isArray(value)) return value[0] === 0 ? `無料〜${yen(value[1])}円` : `${yen(value[0])}〜${yen(value[1])}円`;
    if (typeof value === 'number') return value === 0 ? '無料' : `${yen(value)}円〜`;
  }
  if (axis.type === 'number' && typeof value === 'number') return `${value}${axis.unit ?? ''}`;
  return String(value);
}
