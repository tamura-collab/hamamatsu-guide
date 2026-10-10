// 収集対象データの定義と検証。
// サイト側の型定義（src/data/places.ts）と揃えること。

/** 生データ（収集段階）のフィールド */
export const RAW_FIELDS = {
  name: { label: '店舗・施設名', required: true },
  category: { label: 'カテゴリ（src/data/categories.ts の slug）', required: true },
  genre: { label: 'ジャンル', required: true },
  address: { label: '住所', required: true },
  tel: { label: '電話番号', required: false },
  hours: { label: '営業時間', required: false },
  access: { label: 'アクセス情報', required: false },
  officialUrl: { label: '公式サイトURL', required: false },
  description: { label: '紹介文', required: false },
};

/** 地域文脈（localNote）の種類 */
export const LOCAL_NOTE_TYPES = {
  station: '最寄り駅',
  road: '幹線道路',
  car: '車でのアクセス',
  parking: '駐車場',
  landmark: '目印',
  tip: '地元メモ',
};

export const SOURCES = ['mock', 'scrape', 'manual'];

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * 最終データ 1 件を検証し、問題点のリストを返す（空配列なら OK）。
 * @param {Record<string, unknown>} place
 * @param {Set<string>} categorySlugs そのデータセットで許可されるカテゴリ
 */
export function validatePlace(place, categorySlugs) {
  const errors = [];
  if (!/^[a-z0-9-]+$/.test(place.id ?? '')) errors.push(`id が不正です: ${place.id}`);
  for (const [key, def] of Object.entries(RAW_FIELDS)) {
    const v = place[key];
    if (def.required && !isNonEmptyString(v)) errors.push(`${def.label}（${key}）は必須です`);
    if (!def.required && v !== null && typeof v !== 'string') errors.push(`${key} は文字列か null です`);
  }
  if (place.category && !categorySlugs.has(place.category)) {
    errors.push(`未定義のカテゴリです: ${place.category}`);
  }
  if (place.tel && !/^0\d{1,4}-\d{1,4}-\d{3,4}$/.test(place.tel)) {
    errors.push(`電話番号の形式が不正です: ${place.tel}`);
  }
  if (place.officialUrl && !/^https?:\/\//.test(place.officialUrl)) {
    errors.push(`公式サイトURLが不正です: ${place.officialUrl}`);
  }
  if (!Array.isArray(place.localNote)) {
    errors.push('localNote は配列です');
  } else {
    for (const note of place.localNote) {
      if (!(note.type in LOCAL_NOTE_TYPES)) errors.push(`localNote.type が不正です: ${note.type}`);
      if (!isNonEmptyString(note.text)) errors.push('localNote.text は必須です');
    }
  }
  if (!SOURCES.includes(place.source)) errors.push(`source が不正です: ${place.source}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(place.updatedAt ?? '')) errors.push(`updatedAt が不正です: ${place.updatedAt}`);
  return errors;
}
