/**
 * スクレイピング対象の定義。対象サイトごとに 1 エントリ追加する。
 *
 * 追加前に必ず確認すること:
 *   - 対象サイトの利用規約でクローリング・データ利用が禁止されていないか
 *   - robots.txt（scrape.mjs でも自動チェックする）
 *   - 可能であれば公式API・オープンデータ（自治体の施設一覧CSV等）を優先する
 *
 * @typedef {object} FieldSpec
 * @property {string} selector  各アイテム要素内の CSS セレクタ
 * @property {string} [attr]    テキストではなく属性値を取る場合（例: 'href'）
 *
 * @typedef {object} Source
 * @property {string} name        出力ファイル名（data/raw/{dataset}/{name}.json）
 * @property {boolean} enabled    引数なし実行時の対象にするか
 * @property {'stores'|'spots'} dataset
 * @property {string} category    src/data/categories.ts の slug
 * @property {string} url         一覧ページURL。'fixture:ファイル名' でローカルのHTMLを読む
 * @property {'static'|'browser'} [render] 'browser' は JS 描画が必要なサイト向け（Playwright を使用）
 * @property {string} list        1件分の要素を指す CSS セレクタ
 * @property {Record<string, string|FieldSpec>} fields  収集フィールド → セレクタ
 * @property {Record<string, string>} [defaults]       ページから取れない項目の既定値
 * @property {string} [next]      次ページリンクのセレクタ（ページ送り）
 * @property {number} [maxPages]  取得する最大ページ数（既定 1）
 */

/** @type {Source[]} */
export default [
  {
    // 動作確認用のサンプル（scripts/fixtures/gym-list.html を解析する）
    name: 'sample-fixture',
    enabled: false,
    dataset: 'stores',
    category: 'gym',
    url: 'fixture:gym-list.html',
    list: '.shop-item',
    fields: {
      name: '.shop-name',
      genre: '.shop-genre',
      address: '.shop-address',
      tel: '.shop-tel',
      hours: '.shop-hours',
      access: '.shop-access',
      officialUrl: { selector: 'a.shop-link', attr: 'href' },
    },
    defaults: { genre: 'フィットネス' },
    next: 'a.next-page',
    maxPages: 2,
  },
];
