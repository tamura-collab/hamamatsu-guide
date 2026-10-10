import { createHash } from 'node:crypto';

/** 前後の空白除去・連続空白の圧縮。空文字は null にする */
export function cleanText(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).replace(/[\s　]+/g, ' ').trim();
  return s.length > 0 ? s : null;
}

/**
 * 全角英数字を半角にそろえる（住所・営業時間・アクセスなど）。
 * 括弧や「～」など日本語文中で自然な全角記号は残し、数字に挟まれた区切り文字だけを半角にする。
 *   「中央１－２－３」→「中央1-2-3」、「１０：００〜２２：００」→「10:00～22:00」
 */
export function toHalfWidth(value) {
  const s = cleanText(value);
  if (s === null) return null;
  return s
    .replace(/[０-９Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/(?<=\d)[－‐‑–—―−ー](?=\d)/g, '-')
    .replace(/(?<=\d)：(?=\d)/g, ':')
    .replace(/〜/g, '～');
}

/** 電話番号を「0XX-XXX-XXXX」形式にそろえる。判別できない場合はそのまま返す */
export function normalizeTel(value) {
  const s = toHalfWidth(value);
  if (s === null) return null;
  if (/^0\d{1,4}-\d{1,4}-\d{3,4}$/.test(s)) return s;
  const digits = s.replace(/\D/g, '');
  if (/^0[5789]0\d{8}$/.test(digits)) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (/^0\d{9}$/.test(digits)) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return s;
}

/** http(s) の URL だけを許可し、正規化した文字列を返す */
export function normalizeUrl(value, base) {
  const s = cleanText(value);
  if (s === null) return null;
  try {
    const u = new URL(s, base);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

/**
 * 店舗名 + 住所から安定した ID を作る。
 * 再収集しても同じ店舗なら同じ ID になるため、URL と enrichment.json の紐付けが維持される。
 */
export function makeId(category, name, address) {
  const hash = createHash('sha1').update(`${name}|${address}`).digest('hex').slice(0, 8);
  return `${category}-${hash}`;
}
