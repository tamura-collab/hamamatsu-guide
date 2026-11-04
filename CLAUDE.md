# CLAUDE.md — みんなの浜松ガイド

> **新しいセッション・別アカウントで引き継ぐ場合は、最初に [`HANDOVER.md`](./HANDOVER.md) を読むこと。**
> 経緯、ユーザーの志向、依頼の型（記事追加・A8 リンクの差し替え・写真）、運用、未完了事項をまとめてある。
> 技術仕様（データ構造・ページ構成・環境変数）は [`README.md`](./README.md) を参照。

## 概要
浜松市の「暮らす（生活インフラの比較）」と「訪れる（観光・移動）」を扱う地域メディア。Astro 7 による静的サイトを Vercel に置き、A8.net のアフィリエイトで収益化している。

## 必ず守ること
- **コミット作成者は `tamura <tamura@pinganjapan.com>` にする**（別のアドレスだと Vercel がデプロイを拒否する）。作業前に `git config user.name tamura && git config user.email tamura@pinganjapan.com` を実行する。
- 作業の前に `git pull` を実行する（ユーザーも `main` に直接 push することがある）。ブランチは `main` だけで、直接 push する。
- 完了の条件は、`npm run verify` のエラー・警告・ヒントがすべて0件であること。そのうえでコミットし、`main` に push する（Vercel に自動デプロイ）。
- **事実確認を厳格に行う。** ユーザーの原稿には誤りや実在しない店舗が混ざることがある。公式情報で確認して直し、「原稿 → 修正後」を表で報告する。電話番号・URL・料金は推測で埋めない（`_sources` / `_unverified` で管理する）。
- 著作権のある画像は使わない（Unsplash か、ユーザーが撮影した写真だけを使う）。
- 広告リンクは `data/enrichment.json` の `affiliate`（比較ページ）、または記事の md 内の HTML（ボタンとビーコン。ビーコンは1広告につき1か所）で設定する。PR を含む記事は `articles.ts` で `isPr: true` にする。
- 指示書に書かれたファイルパスは推測であることが多い。実際の構成（記事本文は `src/data/articles/<slug>.md`、メタデータは `src/data/articles.ts`）に読み替え、報告で「ご指定と変えた点」として示す。
- ネイルスクール比較（`tamura-collab/myapp`）と取り違えた依頼に注意する。旧 `myapp/media-site/` は古いコピーなので使わない。
