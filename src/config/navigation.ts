export interface NavItem {
  label: string;
  href: string;
}

/** ヘッダーのカテゴリナビ */
export const mainNav: NavItem[] = [
  { label: '暮らす', href: '/living' },
  { label: '訪れる', href: '/travel' },
  { label: '記事一覧', href: '/articles' },
];

/** フッターのポリシー系リンク */
export const policyNav: NavItem[] = [
  { label: '運営者情報', href: '/about' },
  { label: 'お問い合わせ', href: '/contact' },
  { label: 'プライバシーポリシー', href: '/privacy' },
  { label: '免責事項', href: '/disclaimer' },
  { label: 'アフィリエイト・広告について', href: '/affiliate' },
];
