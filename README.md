# 地域メディアサイト（MVP）

人口30〜100万人規模の地方中核都市向けの地域メディアです。「暮らす（生活インフラ比較）」と「訪れる（観光・移動）」の2本柱で構成しています。
現在の対象都市は **静岡県浜松市**（`citySlug: hamamatsu`）です。親ポータル「みんなの地域ガイド」配下の都市版として展開する想定です。
掲載中の店舗・施設データは開発用のサンプル（架空の店舗名・料金）です。

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
| `npm run verify` | データ検証 + 型チェック + ビルド（デプロイ前の最終確認） |
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
| `/contact` | お問い合わせフォーム（送信先は `siteConfig.contact.formEndpoint`） |
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
├── api/log.js              # 送客ログ収集API（Vercel Functions・モック）
├── integrations/           # robots.txt・sitemap.xml を仕上げるビルドフック
├── vercel.json / netlify.toml / .nvmrc  # デプロイ設定
├── public/                 # favicon などの静的ファイル
└── src/
    ├── config/
    │   ├── cities.ts       # 都市ごとの設定（citySlug・都市名・代表駅・キャッチコピー）
    │   ├── site.config.ts  # サイト名・お問い合わせ先・編集方針・料金注記・更新サイクル・PR表記
    │   └── navigation.ts   # ヘッダー／フッターのリンク
    ├── data/
    │   ├── categories.ts   # 「暮らす」「訪れる」のカテゴリ定義
    │   ├── articles.ts     # 記事のモックデータ
    │   ├── places.ts       # 店舗・スポットの型定義と取得ヘルパー
    │   ├── stores.json     # 店舗データ（生成物・手で編集しない）
    │   └── spots.json      # 観光スポットデータ（生成物・手で編集しない）
    ├── lib/
    │   ├── url.ts          # BASE_PATH を考慮した内部リンク生成 url()
    │   ├── cta.ts          # CTA文言の解決
    │   └── tracking.ts     # 送客クリック計測
    ├── layouts/            # BaseLayout（共通head・ヘッダー・フッター）/ ProseLayout
    ├── components/
    │   ├── layout/         # Header, Footer, MobileMenu, SearchDialog, DialogController, Logo
    │   ├── home/           # Hero, CategorySection
    │   ├── section/        # SectionPage（/living, /travel 共通）, CategoryDetail
    │   ├── cards/          # CategoryCard, ArticleCard
    │   ├── place/          # PlaceCard, PlaceDetail, LocalNoteChips
    │   ├── compare/        # CompareExplorer（比較カード・表、ソート・フィルター）
    │   ├── outbound/       # OutboundLink, CtaBlock, AdNotice, OutboundTracker
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

- **自動抽出**: アクセス情報から「浜松駅徒歩5分」「浜松バイパス沿い」「浜松西ICから車5分」「無料駐車場30台」を抽出（`scripts/lib/local-context.mjs`）
- **人手の補足**: `data/enrichment.json` に ID をキーとして記述。同じ type の自動メモより優先されます。

```json
{
  "gym-09ce24cc": {
    "_name": "24h FIT 浜松駅南店",
    "localNote": [
      { "type": "landmark", "text": "市役所の近く" },
      { "type": "tip", "text": "平日夜は混みやすいので土日午前が狙い目" }
    ],
    "override": { "hours": "6:00～24:00" },
    "specs": { "monthlyFee": 7480, "trial": true },
    "affiliate": { "url": "https://px.a8.net/...", "label": "無料体験を予約する", "program": "A8.net" },
    "hidden": false
  }
}
```

`type` は `station`（最寄り駅）/ `road`（幹線道路）/ `car`（車）/ `parking`（駐車場）/ `landmark`（目印）/ `tip`（地元メモ）。
`override` で収集データの誤りを補正、`specs` で比較値を補正、`affiliate` で広告リンクを設定、`hidden: true` で非掲載にできます。
アフィリエイトリンクは提携契約に基づく情報のため、収集データではなく enrichment.json でのみ設定します。再収集しても enrichment.json は上書きされません。

### 実データの手入力（curated）

公式サイト等で確認した実データは `data/raw/{stores,spots}/curated-<カテゴリ>.json` に `"source": "manual"` で記述します（例: `curated-gym.json`）。

- 実データ（manual / scrape）があるカテゴリでは、`data:build` がモックデータを自動的に除外します。そのカテゴリのページでは「サンプルデータ」注記も表示されません
- 追加フィールド: `features`（特徴タグ）、`priceNote`（店舗固有の料金注記。カード・比較表・詳細ページに共通注記とあわせて表示）、`chain`（複数店舗をまとめた掲載）、`localNote`（地元メモ）、`serviceType`（`store` 実店舗 / `online` Web完結。online は地図ボタンと店舗の構造化データを出さない）
- カテゴリ固有の注記は `categories.ts` の `notice` で指定（例: 車買取「※実際の査定額は車の状態や時期により異なります…」）。指定すると共通の料金注記の代わりに表示されます
- 作成済み: `curated-gym.json`（ジム）、`curated-car-sell.json`（車買取・売却）、`curated-kids-school.json`（キッズスクール・習い事）、`curated-internet.json`（光回線・インターネット。全件 `serviceType: "online"`）
- `_sources`（確認した出典URL）と `_unverified`（未確認の項目）は社内管理用で、サイトには出力されません。公開前に `_unverified` を解消してください
- 電話番号は公式情報で確認できたものだけを入れ、推測で埋めないこと

### スクレイピング

対象サイトは `scripts/sources.config.mjs` に CSS セレクタで定義します（Cheerio で解析。JS描画が必要なサイトは `render: 'browser'` で Playwright を使用、`npm i -D playwright` が必要）。

```bash
npm run data:scrape -- --source=sample-fixture --dry-run   # 同梱のサンプルHTMLで動作確認
```

- リクエスト間に 1.5 秒のインターバル、robots.txt の確認、連絡先付き User-Agent
- 追加前に対象サイトの利用規約を確認し、可能なら公式API・自治体のオープンデータを優先すること
- 実データ運用時は `data/raw/*/mock.json` を削除してから `npm run data:build`

## 比較機能・アフィリエイト導線・送客計測（Phase 3）

### 比較軸（specs）

各カテゴリの比較軸は `src/data/categories.ts` の `axes` で定義し、店舗データの `specs` に値を持ちます。
カテゴリページ（`/living/[category]` 等）の比較カード・比較表、ソート・フィルターは、この定義から自動生成されます。

```ts
{ key: 'monthlyFee', label: '月額目安', type: 'price', unit: '円/月', sort: 'asc', sortLabel: '月額が安い順', primary: true },
{ key: 'trial', label: '体験', type: 'boolean', filter: 'yes', filterLabel: '体験あり' },
```

- `type`: `price` / `number` / `boolean` / `text`。`data:build` が「7,678円」「あり」などを型に合わせて変換・検証します
- `sort` を指定した軸は並び替えの選択肢に、`filter` を指定した軸は絞り込み条件に出ます。`primary` はカードにも表示
- `stationWalkMin`（駅徒歩）と `parking`（駐車場）はアクセス情報から自動算出されます
- 絞り込み状態は URL クエリ（`?sort=monthlyFee&yes=trial&max=stationWalkMin-10`）に反映され、共有できます
- 「おすすめ順」はデータの並び順です。広告の有無では並べ替えません（`/affiliate` の方針と一致させるため）

### アフィリエイトリンク・広告表記

- `OutboundLink` コンポーネントが外部リンクに rel 属性と計測用属性を付与します
  - 公式サイト・予約ページ・広告リンク: `rel="sponsored nofollow noopener noreferrer"`
  - 地図: `rel="noopener noreferrer"` / 電話: なし
- `CtaBlock`: アフィリエイトリンクがある店舗はマイクロコピー付きのCTAボタン（文言は `categories.ts` の `cta`、`{station}` は代表駅に置換）、ない店舗は「公式サイトを見る」
- 広告表記: カテゴリ・詳細ページの冒頭に「アフィリエイト広告が含まれています（PR）」、広告リンクのあるカードとCTAの直下にも PR 表記
- `siteConfig.sampleData` が `true` の間は「サンプルデータ」の注意書きを表示します。実データに切り替えたら `false` に

### 送客（アウトバウンドクリック）計測

`data-track` 属性を持つリンク（`OutboundLink`）のクリックを `src/lib/tracking.ts` が計測し、次のイベントを送信します。

```json
{ "event": "outbound_click", "type": "affiliate", "placeId": "gym-09ce24cc", "category": "gym", "section": "living",
  "placement": "compare-card", "citySlug": "hamamatsu", "href": "https://...", "page": "/living/gym", "timestamp": "2026-10-10T05:32:33.586Z" }
```

| 送信先 | 有効になる条件 |
| --- | --- |
| `window.__outboundLog`（直近50件） | 常に（デバッグ・E2Eテスト用） |
| ブラウザのコンソール | `npm run dev` 実行時 |
| GA4（イベント名 `outbound_click`） | `PUBLIC_GA4_ID` を設定 |
| 自社ログAPI（`navigator.sendBeacon`） | `PUBLIC_LOG_ENDPOINT` を設定（例: `/api/log`） |

`api/log.js` は Vercel Functions 用のモックで、受け取ったイベントを検証してログ出力します。本番運用時は保存先（Vercel KV / Supabase / BigQuery 等）への書き込みに置き換えてください。

## 編集方針・料金表記・更新日（Phase 5）

- **信頼性・編集方針**: トップページのカードと運営者情報の「編集方針」は `site.config.ts` の `trustPoints` を共通で表示します。実際の運用と一致する内容だけを書いてください
- **料金表記**: 料金系の比較軸（`type: 'price'`）はすべて目安として表示します
  - 下限のみ → 「7,700円〜」、価格帯 `[下限, 上限]` → 「6,800〜12,000円」、0 → 「無料」
  - 収集データの「6,800〜12,000円」のような表記は `data:build` が自動で価格帯に変換します。並び替え・最安表示は下限で判定
  - 比較テーブル・詳細ページ・検索結果の料金の近くには `PriceNote` が `site.config.ts` の `priceNotice` を自動表示します
- **更新サイクル・最終更新**: `UpdateInfo` が「データ更新サイクル: 月1回（最終更新: 2026年10月）」を表示します（トップ・カテゴリ・詳細・運営者情報・フッター）
  - 更新サイクルは `site.config.ts` の `updateFrequency`、最終更新はビルド実行時の年月（日本時間、`src/lib/build-info.ts`）
  - `npm run build` するだけで最新の年月になります。検証時は `BUILD_DATE=2026-12-01` のように固定できます
  - ビルドのたびに年月が進むため、データ更新を伴わない再ビルドでも表示上の「最終更新」は変わります。運用サイクル（データ更新 → 再ビルド）を `updateFrequency` に合わせてください

## 別の都市への展開・カスタマイズ

- 都市の追加: `src/config/cities.ts` にエントリを追加し、環境変数 `CITY=<citySlug>` でビルド（サイト名・タイトル・パンくず・ヒーロー・meta に反映）
- 親ポータルのURLが決まったら `src/config/site.config.ts` の `portal.url` を設定（パンくずの先頭に表示）
- お問い合わせ: `siteConfig.contact.formEndpoint`（フォーム送信先）と `sns`（公式SNS）。メールアドレスはサイトに掲載しない方針
- カテゴリの追加／変更: `src/data/categories.ts`（追加すると一覧・詳細・メニュー・フッターに自動反映）
- 配色: `src/styles/global.css` の `@theme`（`brand` / `living` / `travel`）

## ドメイン非依存の設計

- 内部リンクはすべて `url('/path')` で生成するルート相対パスで、ドメインを含みません。
- canonical・OGP・sitemap・robots.txt で使う絶対URLは、ビルド時の環境変数から決まります。

| 環境変数 | 用途 | 未設定時 |
| --- | --- | --- |
| `SITE_URL` | 正規URL（例: `https://example.jp`） | Vercel では `VERCEL_PROJECT_PRODUCTION_URL`、それ以外は `http://localhost:4321` |
| `CITY` | 対象都市（`src/config/cities.ts` の citySlug） | `hamamatsu` |
| `NOINDEX` | `true` で全ページ noindex・robots.txt 全体 Disallow | プレビュー環境では自動で `true` |
| `PUBLIC_GA4_ID` | GA4 測定ID | 未設定（GA4を読み込まない） |
| `PUBLIC_LOG_ENDPOINT` | 送客ログの送信先 | 未設定（送信しない） |
| `BASE_PATH` | サブディレクトリ配信時のみ（例: `/media`） | `/` |

独自ドメインへ移行する際は `SITE_URL` を変更して再ビルドするだけで済みます。

## SEO・パフォーマンス（Phase 4）

- **URL**: 末尾スラッシュなし・拡張子なし（`/living/gym`）に統一。`build.format: 'file'` で `living/gym.html` として出力し、どのホスティングでも追加設定なしで配信されます
- **sitemap**: `@astrojs/sitemap` が `sitemap-index.xml` / `sitemap-0.xml` を生成し、別名の `sitemap.xml` も出力（`/search`・404 は除外）
- **robots.txt**: `public/robots.txt` をビルド時に仕上げます（`integrations/seo-files.mjs`）。`{{SITE_URL}}` を本番URLに置換し、プレビュー環境では全体を `Disallow: /` に差し替え
- **OGP / Twitter Card**: `BaseLayout` で全ページに出力。共有画像は都市ごとの `public/og/<citySlug>.jpg`（1200×630、`cities.ts` の `ogImage`）。ページ単位で `image` を渡して差し替え可能
- **構造化データ**: トップに `WebSite`（サイト内検索つき）、各ページに `BreadcrumbList`、詳細ページに `LocalBusiness` 等
- **noindex**: プレビュー環境（Vercel Preview / Netlify Deploy Preview・Branch deploy / Cloudflare Pages の本番以外のブランチ）や `NOINDEX=true` のビルドは全ページ `noindex`
- **画像**: 写真を追加するときは `ResponsiveImage`（`src/components/ui/`）を使う。AVIF / WebP と幅違いの srcset を生成し、既定で遅延読み込み。ファーストビューの画像だけ `priority` を指定
- **JavaScript**: 完全な静的出力（`output: 'static'`）。クライアント JS はメニュー開閉（約1.3KB）と送客計測（約1KB）をページに直接埋め込み、比較・検索・お問い合わせページのみ追加の小さなスクリプトを持ちます。外部ライブラリ・Web フォントは読み込みません

## デプロイ

`npm run verify`（データ検証 → 型チェック → ビルド）がローカルで通ることを確認してからデプロイしてください。
いずれのサービスも **Root（Base）Directory を `media-site`** に設定します。Node.js は `.nvmrc`（22）で指定しています。

| サービス | 設定ファイル | ビルドコマンド / 出力 | 本番URL |
| --- | --- | --- | --- |
| Vercel | `vercel.json` | `npm run build` / `dist` | `SITE_URL` 未設定なら Vercel の本番URLを自動使用 |
| Netlify | `netlify.toml` + `public/_headers` | `npm run build` / `dist` | `SITE_URL` 未設定なら Netlify の本番URLを自動使用 |
| Cloudflare Pages | `public/_headers` | `npm run build` / `dist`（管理画面で指定） | **`SITE_URL` を設定**。本番ブランチが main 以外なら `PRODUCTION_BRANCH` も |

- キャッシュ（`/_astro/*` は1年 immutable）とセキュリティヘッダーは `vercel.json` / `public/_headers` に同じ内容で定義しています
- 送客ログ API（`api/log.js`）は Vercel Functions 専用です。他のサービスでは各サービスの Functions に移植してください
- 環境変数は `.env.example` に一覧があります。独自ドメインへ移行するときは `SITE_URL` を変えて再デプロイします

## 法令対応（景表法・ステマ規制）

- 全ページのヘッダー上部に広告を含む旨を表記（文言は `siteConfig.prDisclosure`）
- PRを含む記事・掲載枠には `PrBadge` を表示（`articles.ts` の `isPr`、店舗データの `affiliate`）
- カテゴリ・詳細ページ冒頭に「アフィリエイト広告が含まれています（PR）」を表示（`AdNotice`）
- フッターと `/affiliate` にアフィリエイト開示を掲載
- 公式サイト・予約・広告リンクには `OutboundLink` が `rel="sponsored nofollow noopener noreferrer"` を自動付与

## 今後の拡張候補

- 記事を Content Collections（Markdown）または CMS へ移行
- 検索を Pagefind 等の静的検索インデックスに置き換え
- 比較表に料金などカテゴリ固有の項目を追加
- OGP画像の生成、アクセス解析の導入
