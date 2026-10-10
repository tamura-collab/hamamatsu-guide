/**
 * ビルド情報。静的ビルド（SSG）の実行時点で評価されるため、`npm run build` するだけで
 * 「最終更新」の年月が最新化される（手動で日付を書き換える必要はない）。
 *
 * ホスティングのビルド環境は UTC のことが多いため、日本時間（Asia/Tokyo）で年月を決める。
 * 環境変数 BUILD_DATE（例: 2026-10-01）を指定すると、その日付で固定できる（検証・再現ビルド用）。
 */
const TIME_ZONE = 'Asia/Tokyo';

function resolveBuildDate(): Date {
  const override = typeof process !== 'undefined' ? process.env.BUILD_DATE : undefined;
  if (override) {
    const d = new Date(override);
    if (!Number.isNaN(d.getTime())) return d;
    console.warn(`[build-info] BUILD_DATE="${override}" を日付として解釈できないため、現在時刻を使います`);
  }
  return new Date();
}

export const buildDate = resolveBuildDate();

const parts = Object.fromEntries(
  new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(buildDate)
    .map((p) => [p.type, p.value]),
);

/** 例: 2026 */
export const buildYear = Number(parts.year);
/** 例: 10 */
export const buildMonth = Number(parts.month);
/** <time datetime> 用（例: 2026-10） */
export const buildYearMonthIso = `${parts.year}-${parts.month}`;
/** 表示用（例: 2026年10月） */
export const buildYearMonthLabel = `${buildYear}年${buildMonth}月`;
