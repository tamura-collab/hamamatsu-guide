/**
 * 送客ログ収集 API（モック）: POST /api/log
 *
 * Vercel にデプロイすると Vercel Functions として動作する（Root Directory = media-site の場合）。
 * 有効化するには環境変数 PUBLIC_LOG_ENDPOINT=/api/log を設定して再ビルドする。
 * 現在は受け取ったイベントを検証してログ出力するだけ。本番運用時は保存先
 * （Vercel KV / Supabase / BigQuery など）への書き込みに置き換える。
 */
const TYPES = new Set(['affiliate', 'official', 'map', 'tel']);
const MAX_BODY = 4 * 1024;

export function validateEvent(e) {
  if (typeof e !== 'object' || e === null) return 'body must be an object';
  if (e.event !== 'outbound_click') return 'event must be "outbound_click"';
  if (!TYPES.has(e.type)) return 'invalid type';
  if (typeof e.page !== 'string' || typeof e.href !== 'string') return 'page and href are required';
  if (Number.isNaN(Date.parse(e.timestamp))) return 'invalid timestamp';
  return null;
}

export async function POST(request) {
  const text = await request.text();
  if (text.length > MAX_BODY) return new Response('payload too large', { status: 413 });

  let event;
  try {
    event = JSON.parse(text);
  } catch {
    return new Response('invalid json', { status: 400 });
  }
  const error = validateEvent(event);
  if (error) return new Response(error, { status: 400 });

  // TODO: 永続化。ここではログ出力のみ（Vercel のログで確認できる）
  console.log(JSON.stringify({ ...event, receivedAt: new Date().toISOString() }));
  return new Response(null, { status: 204 });
}
