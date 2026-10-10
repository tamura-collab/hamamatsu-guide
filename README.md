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
| `npm run data` | モックデータ生成 → `src/data/*.json` 再生成 |
| `npm run data:mock` | モックの生データを `data/raw/` に生成 |
| `npm run data:scrape` | スクレイピングで生データを収集 |
| `npm run data:build` | 生データを正規化・地域文脈付与・検証して `src/data/*.json` を生成（`-- --check` で検証のみ） |

## ページ構成

| パス | 内容 |
| --- | --- |
| `/` | トップ（ヒーロー・検索、暮らす／訪れるカード、新着・おすすめ記事） |
| `/living` | 「暮らす」一覧 |
| `/travel` | 「訪れる」一覧 |
| `/living/[category]` `/travel/[category]` | カテゴリ一覧・比較表（JSONデータから生成） |
| `/living/[category]/[id]` | 店舗詳細（`src/data/stores.json` から自動生成） |
| `/travel/[category]/[id]` | 観光スポット詳細（`src/data/spots.json` から自動生成） |
| `/articles` `/articles/[slug]` | 記事一覧・記事詳細（モック） |
| `/search?q=` | サイト内検索（クライアントサイド） |
| `/about` `/privacy` `/disclaimer` `/affiliate` | 運営者情報・プライバシーポリシー・免責事項・アフィリエイト開示 |

## ディレクトリ構成

```
media-site/
├── astro.config.mjs        # SITE_URL / BASE_PATH を環境変数から読み込む
├── data/
│   ├── raw/{stores,spots}/ # 収集した生データ（mock.json / スクレイピング結果）
│   └── enrichment.json     # 人手の補正・地域文脈メモ（localNote）
├── scripts/                # データ収集・加工スクリプト（後述）
├── public/                 # favicon などの静的ファイル
└── src/
    ├── config/
    │   ├── site.ts         # サイト名・対象都市・キャッチコピー・PR表記
    │   └── navigation.ts   # ヘッダー／フッターのリンク
    ├── data/
    │   ├── categories.ts   # 「暮らす」「訪れる」のカテゴリ定義
    │   ├── articles.ts     # 記事のモックデータ
    │   ├── places.ts       # 店舗・スポットの型定義と取得ヘルパー
    │   ├── stores.json     # 店舗データ（生成物・手で編集しない）
    │   └── spots.json      # 観光スポットデータ（生成物・手で編集しない）
    ├── lib/url.ts          # BASE_PATH を考慮した内部リンク生成 url()
    ├── layouts/            # BaseLayout（共通head・ヘッダー・フッター）/ ProseLayout
    ├── components/
    │   ├── layout/         # Header, Footer, MobileMenu, SearchDialog, DialogController, Logo
    │   ├── home/           # Hero, CategorySection
    │   ├── section/        # SectionPage（/living, /travel 共通）, CategoryDetail
    │   ├── cards/          # CategoryCard, ArticleCard
    │   ├── place/          # PlaceCard, PlaceDetail, LocalNoteChips
    │   └── ui/             # Icon, SectionHeading, Breadcrumb, PrBadge
    ├── pages/              # ルーティング
    └── styles/global.css   # Tailwind 読み込み + デザイントークン（色・フォント）
```

## データ収集と詳細ページ生成（Phase 2）

```
data/raw/{stores,spots}/*.json ─┐
  （mock.json / スクレイピング結果） ├─ npm run data:build ─→ src/data/stores.json ─→ /living/[category]/[id]
data/enrichment.json ───────────┘   正規化・ID付与・補正・        src/data/spots.json  ─→ /travel/[category]/[id]
  （人手の補正・地域文脈メモ）          地域文脈付与・検証                              （ビルド時に静的生成）
```

### 収集対象データ（1件あたり）

| フィールド | 内容 | 必須 |
| --- | --- | --- |
| `id` | `カテゴリ-ハッシュ`（店舗名＋住所から生成。再収集しても変わらない） | 自動 |
| `name` / `category` / `genre` / `address` | 店舗名・カテゴリ slug・ジャンル・住所 | ✔ |
| `tel` / `hours` / `access` / `officialUrl` | 電話番号・営業時間・アクセス・公式サイトURL | |
| `description` | 紹介文 | |
| `localNote` | 地域文脈メモの配列 `{ type, text, source }` | 自動 |
| `source` / `updatedAt` | 取得元（mock / scrape / manual）・情報確認日 | 自動 |

`stores.json` は「暮らす」、`spots.json` は「訪れる」のカテゴリに対応します（カテゴリは `src/data/categories.ts` と共通）。

### 地域文脈（localNote）

- **自動抽出**: アクセス情報から「みなと駅徒歩5分」「臨港バイパス沿い」「みなと北ICから車5分」「無料駐車場30台」を抽出（`scripts/lib/local-context.mjs`）
- **人手の補足**: `data/enrichment.json` に ID をキーとして記述。同じ type の自動メモより優先されます。

```json
{
  "gym-b75bc8eb": {
    "_name": "24h FIT みなと中央店",
    "localNote": [
      { "type": "landmark", "text": "郵便局の向かい" },
      { "type": "tip", "text": "平日夜は混みやすいので土日午前が狙い目" }
    ],
    "override": { "hours": "6:00～24:00" },
    "hidden": false
  }
}
```

`type` は `station`（最寄り駅）/ `road`（幹線道路）/ `car`（車）/ `parking`（駐車場）/ `landmark`（目印）/ `tip`（地元メモ）。
`override` で収集データの誤りを補正、`hidden: true` で非掲載にできます。再収集しても enrichment.json は上書きされません。

### スクレイピング

対象サイトは `scripts/sources.config.mjs` に CSS セレクタで定義します（Cheerio で解析。JS描画が必要なサイトは `render: 'browser'` で Playwright を使用、`npm i -D playwright` が必要）。

```bash
npm run data:scrape -- --source=sample-fixture --dry-run   # 同梱のサンプルHTMLで動作確認
```

- リクエスト間に 1.5 秒のインターバル、robots.txt の確認、連絡先付き User-Agent
- 追加前に対象サイトの利用規約を確認し、可能なら公式API・自治体のオープンデータを優先すること
- 実データ運用時は `data/raw/*/mock.json` を削除してから `npm run data:build`

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
- 比較表に料金などカテゴリ固有の項目を追加
- OGP画像の生成、アクセス解析の導入
