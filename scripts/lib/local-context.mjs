// 地域文脈（localNote）の自動付与。
// アクセス情報などのテキストから「〇〇駅徒歩X分」「〇〇バイパス沿い」といった
// ユーザーが判断しやすい短いメモを抽出する。人手の補正（enrichment.json）が優先される。

// 文中の区切り文字（ここで地名の切れ目とみなす）
const SEP = '\\s、。・,，/／（）()「」';
const NAME = `[^${SEP}]`;

const RULES = [
  {
    type: 'station',
    pattern: new RegExp(`(${NAME}+駅)(?:から|より)?\\s*(?:徒歩|歩いて)\\s*(?:約)?(\\d+)\\s*分`, 'g'),
    format: (m) => `${m[1]}徒歩${m[2]}分`,
  },
  {
    type: 'road',
    pattern: new RegExp(`((?:国道|県道)\\d+号線?|${NAME}+?(?:バイパス|通り|街道|環状線))(?:沿い|沿線)`, 'g'),
    format: (m) => `${m[1]}沿い`,
  },
  {
    type: 'car',
    pattern: new RegExp(`(${NAME}+?(?:IC|インター))(?:から|より)\\s*(?:車で)?\\s*(?:約)?(\\d+)\\s*分`, 'g'),
    format: (m) => `${m[1]}から車${m[2]}分`,
  },
  {
    type: 'parking',
    pattern: /(?:無料)?駐車場\s*(?:あり)?\s*[（(]?\s*(\d+)\s*台/g,
    format: (m) => `${m[0].startsWith('無料') ? '無料' : ''}駐車場${m[1]}台`,
  },
];

/**
 * @param {string | null} text アクセス情報など
 * @returns {{ type: string, text: string, source: 'auto' }[]}
 */
export function inferLocalNotes(text) {
  if (!text) return [];
  const notes = [];
  for (const rule of RULES) {
    for (const m of text.matchAll(rule.pattern)) {
      notes.push({ type: rule.type, text: rule.format(m, text), source: 'auto' });
    }
  }
  return dedupe(notes);
}

/**
 * 自動抽出と人手のメモを統合する。
 * 人手のメモと同じ type の自動メモは捨て、人手のメモを先頭に並べる。
 */
export function mergeLocalNotes(auto, manual = []) {
  const manualNotes = manual.map((n) => ({ type: n.type, text: n.text, source: 'manual' }));
  const manualTypes = new Set(manualNotes.map((n) => n.type));
  return dedupe([...manualNotes, ...auto.filter((n) => !manualTypes.has(n.type))]);
}

function dedupe(notes) {
  const seen = new Set();
  return notes.filter((n) => {
    const key = `${n.type}:${n.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
