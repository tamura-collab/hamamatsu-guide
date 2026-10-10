/**
 * BASE_PATH を考慮した内部リンクを生成する。
 * ドメインは含めない相対（ルート相対）パスを返すため、ドメイン移行の影響を受けない。
 *
 *   url('/living')        -> '/living'        (BASE_PATH 未設定時)
 *   url('/living')        -> '/media/living'  (BASE_PATH=/media 時)
 */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}` || '/';
}

/** 現在のパスがナビ項目に該当するか（アクティブ表示用） */
export function isActive(currentPath: string, href: string): boolean {
  const target = url(href).replace(/\/$/, '');
  const current = currentPath.replace(/\/$/, '');
  if (target === url('/').replace(/\/$/, '')) return current === target;
  return current === target || current.startsWith(`${target}/`);
}
