# 地域メディアサイト（MVP）

人口30〜100万人規模の地方中核都市向けの地域メディアです。「暮らす（生活インフラ比較）」と「訪れる（観光・移動）」の2本柱で構成しています。
モック用の対象都市は架空の「みなと市」です。

- **技術スタック**: Astro 7（静的サイト出力）/ Tailwind CSS v4 / TypeScript
- **要件**: Node.js 22.12 以上

## ローカルで確認する

```bash
cd media-site
npm install
npm run dev        # http://localhost:4321
```

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | `dist/` に静的ファイルを出力 |
| `npm run preview` | ビルド結果をローカルで確認 |
| `npm run check` | 型チェック（astro check） |

## ページ構成

| パス | 内容 |
| --- | --- |
| `/` | トップ（ヒーロー・検索、暮らす／訪れるカード、新着・おすすめ記事） |
| `/living` | 「暮らす」一覧 |
| `/travel` | 「訪れる」一覧 |
| `/living/[slug]` `/travel/[slug]` | カテゴリ詳細（比較表のモック） |
| `/articles` `/articles/[slug]` | 記事一覧・記事詳細（モック） |
| `/search?q=` | サイト内検索（クライアントサイド） |
| `/about` `/privacy` `/disclaimer` `/affiliate` | 運営者情報・プライバシーポリシー・免責事項・アフィリエイト開示 |

## ディレクトリ構成

```
media-site/
├── astro.config.mjs        # SITE_URL / BASE_PATH を環境変数から読み込む
├── public/                 # favicon などの静的ファイル
└── src/
    ├── config/
    │   ├── site.ts         # サイト名・対象都市・キャッチコピー・PR表記
    │   └── navigation.ts   # ヘッダー／フッターのリンク
    ├── data/
    │   ├── categories.ts   # 「暮らす」「訪れる」のカテゴリ定義
    │   └── articles.ts     # 記事のモックデータ
    ├── lib/url.ts          # BASE_PATH を考慮した内部リンク生成 url()
    ├── layouts/            # BaseLayout（共通head・ヘッダー・フッター）/ ProseLayout
    ├── components/
    │   ├── layout/         # Header, Footer, MobileMenu, SearchDialog, DialogController, Logo
    │   ├── home/           # Hero, CategorySection
    │   ├── section/        # SectionPage（/living, /travel 共通）, CategoryDetail
    │   ├── cards/          # CategoryCard, ArticleCard
    │   └── ui/             # Icon, SectionHeading, Breadcrumb, PrBadge
    ├── pages/              # ルーティング
    └── styles/global.css   # Tailwind 読み込み + デザイントークン（色・フォント）
```

## 別の都市への展開・カスタマイズ

- 都市名・サイト名・キャッチコピー: `src/config/site.ts`
- カテゴリの追加／変更: `src/data/categories.ts`（追加すると一覧・詳細・メニュー・フッターに自動反映）
- 配色: `src/styles/global.css` の `@theme`（`brand` / `living` / `travel`）

## ドメイン非依存の設計

- 内部リンクはすべて `url('/path')` で生成するルート相対パスで、ドメインを含みません。
- canonical・OGP・sitemap・robots.txt で使う絶対URLは、ビルド時の環境変数から決まります。

| 環境変数 | 用途 | 未設定時 |
| --- | --- | --- |
| `SITE_URL` | 正規URL（例: `https://example.jp`） | Vercel では `VERCEL_PROJECT_PRODUCTION_URL`、それ以外は `http://localhost:4321` |
| `BASE_PATH` | サブディレクトリ配信時のみ（例: `/media`） | `/` |

独自ドメインへ移行する際は `SITE_URL` を変更して再ビルドするだけで済みます。

## Vercel へのデプロイ

1. Vercel でこのリポジトリをインポート
2. **Root Directory** を `media-site` に設定（Framework Preset は Astro が自動検出されます）
3. 独自ドメインを使う場合は、環境変数 `SITE_URL` を設定

静的出力のため、アダプターは不要です。

## 法令対応（景表法・ステマ規制）

- 全ページのヘッダー上部に広告を含む旨を表記（文言は `siteConfig.prDisclosure`）
- PRを含む記事・掲載枠には `PrBadge` を表示（`articles.ts` の `isPr`）
- フッターと `/affiliate` にアフィリエイト開示を掲載
- 外部の広告リンクには `rel="sponsored"` を付与する運用とする

## 今後の拡張候補

- 記事を Content Collections（Markdown）または CMS へ移行
- 検索を Pagefind 等の静的検索インデックスに置き換え
- 比較表データを DB / API から取得
- OGP画像の生成、アクセス解析の導入
