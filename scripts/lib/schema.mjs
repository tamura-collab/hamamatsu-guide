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

/**
 * 比較軸の値を型に合わせて変換する（スクレイピング結果の「7,678円」「あり」などを数値・真偽値へ）。
 * 変換できない場合は undefined を返す。
 */
const normalizeRange = (min, max) => (min === max ? min : [Math.min(min, max), Math.max(min, max)]);

export function coerceSpec(axis, value) {
  if (value === null || value === undefined || value === '') return null;
  switch (axis.type) {
    case 'price': {
      // 価格帯: [下限, 上限] または「6,800〜12,000円」
      if (Array.isArray(value)) {
        const [min, max] = value.map(Number);
        return Number.isFinite(min) && Number.isFinite(max) ? normalizeRange(min, max) : undefined;
      }
      if (typeof value === 'string') {
        const v = value.replace(/[,，]/g, '');
        const range = v.match(/(\d+(?:\.\d+)?)\s*[〜～~\-－]\s*(\d+(?:\.\d+)?)/);
        if (range) return normalizeRange(Number(range[1]), Number(range[2]));
      }
      return coerceSpec({ ...axis, type: 'number' }, value);
    }
    case 'number': {
      if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
      if (/^(無料|0円)$/.test(String(value).trim())) return 0;
      const m = String(value).replace(/[,，]/g, '').match(/\d+(?:\.\d+)?/);
      return m ? Number(m[0]) : undefined;
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      const v = String(value).trim();
      if (/^(あり|有|○|〇|可|対応|yes|true)$/i.test(v)) return true;
      if (/^(なし|無|×|不可|非対応|no|false)$/i.test(v)) return false;
      return undefined;
    }
    default:
      return String(value).trim() || null;
  }
}

const EXPECTED_TYPE = { price: 'number', number: 'number', boolean: 'boolean', text: 'string' };

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * 最終データ 1 件を検証し、問題点のリストを返す（空配列なら OK）。
 * @param {Record<string, any>} place
 * @param {Map<string, { axes: { key: string, type: string }[] }>} categoryMap そのデータセットで許可されるカテゴリ
 */
export function validatePlace(place, categoryMap) {
  const errors = [];
  if (!/^[a-z0-9-]+$/.test(place.id ?? '')) errors.push(`id が不正です: ${place.id}`);
  for (const [key, def] of Object.entries(RAW_FIELDS)) {
    const v = place[key];
    if (def.required && !isNonEmptyString(v)) errors.push(`${def.label}（${key}）は必須です`);
    if (!def.required && v !== null && typeof v !== 'string') errors.push(`${key} は文字列か null です`);
  }
  const category = categoryMap.get(place.category);
  if (place.category && !category) {
    errors.push(`未定義のカテゴリです: ${place.category}`);
  }
  if (typeof place.specs !== 'object' || place.specs === null) {
    errors.push('specs はオブジェクトです');
  } else if (category) {
    const axes = new Map(category.axes.map((a) => [a.key, a]));
    for (const [key, value] of Object.entries(place.specs)) {
      const axis = axes.get(key);
      if (!axis) errors.push(`specs.${key} はカテゴリ「${place.category}」の比較軸にありません`);
      else if (axis.type === 'price' && Array.isArray(value)) {
        if (value.length !== 2 || !value.every((n) => typeof n === 'number' && n >= 0) || value[0] > value[1]) {
          errors.push(`specs.${key} の価格帯は [下限, 上限] の数値です（値: ${JSON.stringify(value)}）`);
        }
      } else if (value !== null && typeof value !== EXPECTED_TYPE[axis.type]) {
        errors.push(`specs.${key} は ${EXPECTED_TYPE[axis.type]} です（値: ${JSON.stringify(value)}）`);
      } else if (typeof value === 'number' && value < 0) errors.push(`specs.${key} が負の値です`);
    }
  }
  if (place.affiliate !== null) {
    if (typeof place.affiliate !== 'object' || !/^https?:\/\//.test(place.affiliate?.url ?? '')) {
      errors.push(`affiliate.url が不正です: ${place.affiliate?.url}`);
    }
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
