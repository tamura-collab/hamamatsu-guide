/**
 * ふるさと納税サイトの紹介データ（記事内の「ふるさと納税でお取り寄せ」ブロック用）。
 *
 * 記事の Markdown に <div data-furusato></div> を置くと、ビルド時にこのデータからブロックを組み立てる
 * （src/lib/furusato.ts）。広告リンクの差し替え・追加はこのファイルだけ直せばよい。
 *   - affiliate がある … 広告リンク（rel="sponsored"）。バナー・計測ビーコンも出力
 *   - affiliate が null … 公式サイトへの通常リンク（後日 ASP リンクに差し替える準備枠）
 * 計測ビーコンは多重カウントを防ぐため、記事内で最初のブロックにだけ出力する。
 *
 * 注意: 2025年10月1日から、ポータルサイトが寄付に応じてポイントを付与することは総務省の基準で禁止されている。
 * 「ポイントが貯まる」とは書かない。
 */
export interface FurusatoAffiliate {
  url: string;
  /** A8.net などのバナー画像（未指定ならテキストリンクのみ） */
  bannerImageUrl?: string;
  bannerWidth?: number;
  bannerHeight?: number;
  /** インプレッション計測用 1x1 画像 */
  impressionUrl?: string;
  program: string;
}

export interface FurusatoService {
  id: string;
  name: string;
  officialUrl: string;
  /** 一言の特徴（確認できた内容のみ） */
  summary: string;
  /** 向いている人 */
  recommendedFor: string;
  affiliate: FurusatoAffiliate | null;
}

export const furusatoServices: FurusatoService[] = [
  {
    id: 'aupay',
    name: 'au PAY ふるさと納税',
    officialUrl: 'https://furusato.wowma.jp/',
    summary: 'Pontaポイントを寄付に使え、auかんたん決済にも対応',
    recommendedFor: 'Pontaポイントを使いたい人・auユーザー',
    affiliate: {
      url: 'https://px.a8.net/svt/ejp?a8mat=4BGCF0+CR18YI+54OC+5Z6WX',
      bannerImageUrl: 'https://www28.a8.net/svt/bgt?aid=261103068771&wid=002&eno=01&mid=s00000023934001004000&mc=1',
      impressionUrl: 'https://www19.a8.net/0.gif?a8mat=4BGCF0+CR18YI+54OC+5Z6WX',
      program: 'A8.net',
    },
  },
  {
    id: 'satofull',
    name: 'さとふる',
    officialUrl: 'https://www.satofull.jp/',
    summary: 'お礼品の発送状況をマイページや配送カレンダーで確認できる',
    recommendedFor: 'お礼品がいつ届くかを把握したい人',
    affiliate: null,
  },
  {
    id: 'furusato-choice',
    name: 'ふるさとチョイス',
    officialUrl: 'https://www.furusato-tax.jp/',
    summary: '全国の自治体のお礼品を地域やカテゴリから探せる',
    recommendedFor: '寄付先の自治体をじっくり選びたい人',
    affiliate: null,
  },
];
