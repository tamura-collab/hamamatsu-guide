/**
 * サイト全体の設定。
 * 対象都市は環境変数 CITY（未設定時は hamamatsu）で src/config/cities.ts から選ぶ。
 * 独自ドメインへの移行は SITE_URL / BASE_PATH で行い、URL はコードにハードコードしない
 * （内部リンクは `lib/url.ts` の `url()` を経由して生成する）。
 */
import { cities, type CityConfig, type CitySlug } from './cities';
import type { IconName } from '@/components/ui/icons';

const envCity = (typeof process !== 'undefined' ? process.env.CITY : undefined) as CitySlug | undefined;
const citySlug: CitySlug = envCity && envCity in cities ? envCity : 'hamamatsu';
const city: CityConfig = cities[citySlug];

/** 親ポータル（マルチ都市展開時のトップ）。url を設定するとパンくずの先頭に表示される */
export const portal = {
  name: 'みんなの地域ガイド',
  url: null as string | null,
};

export const siteConfig = {
  citySlug,
  city,
  portal,
  /** サイト名（ロゴ・title に使用） */
  siteName: `みんなの${city.shortName}ガイド`,
  /** ロゴ下のサブテキスト */
  siteNameEn: `${city.nameEn} LOCAL GUIDE`,
  catchCopy: city.catchCopy,
  description: `${city.prefecture}${city.name}の「暮らし」と「おでかけ」をまとめた地域特化メディア。ジム・光回線・車買取などの生活インフラ比較から、レンタカー・ホテル・雨の日スポットまで、地元目線で分かりやすく紹介します。`,
  operator: {
    name: `みんなの${city.shortName}ガイド編集部`,
  },
  /**
   * お問い合わせ先。メールアドレスはサイト上に掲載しない。
   *   formEndpoint: フォームの送信先（Formspree / Googleフォーム / 自社API 等）。null の間は送信機能を準備中として表示
   *   sns: 公式SNSアカウント（アカウント開設後に追加）
   */
  contact: {
    formEndpoint: null as string | null,
    sns: [] as { name: string; url: string; handle: string }[],
  },
  /** SNS（Twitter Card の twitter:site に使用。アカウント開設後に '@handle' を設定） */
  social: {
    twitterHandle: null as string | null,
  },
  /**
   * データの更新サイクル（表示用）。最終更新年月はビルド時に自動で入る（src/lib/build-info.ts）。
   * 実際の運用（データ更新 → 再ビルド）の頻度と一致させること。
   */
  updateFrequency: '月1回',
  /**
   * 信頼性・編集方針（トップページのカードと運営者情報の「編集方針」で共通使用）。
   * 実際の運用と一致する内容だけを書くこと。
   */
  trustPoints: [
    {
      icon: 'mapPin',
      title: '公式・地域データの集約',
      text: '店舗・施設の公式情報や公的データをもとに、アクセス性や利便性を独自に整理しています。',
    },
    {
      icon: 'shield',
      title: '編集部による総合評価',
      text: '価格帯やサービス内容、Google等の口コミ評判を踏まえ、編集部が客観的に比較・評価しています。',
    },
    {
      icon: 'info',
      title: '透明性のある広告表記',
      text: '景表法（ステマ規制）に基づき、アフィリエイト等の広告リンクを含むページには明確にPR表記を行っています。',
    },
  ] as const satisfies readonly { icon: IconName; title: string; text: string }[],
  /** 料金表記の近くに自動表示する注記 */
  priceNotice: '※掲載している料金は目安です。最新の料金やキャンペーン情報は各公式サイトでご確認ください。',
  /** 店舗カードの料金欄に添える短い注記 */
  priceNoticeShort: '※最新の料金やキャンペーン情報は公式サイトでご確認ください',
  /** 景表法（ステマ規制）対応の関係性表記 */
  prDisclosure: '※当サイトはアフィリエイトプログラムを利用しており、記事内に広告・PRを含みます。',
  /**
   * 掲載中の店舗・スポットデータが開発用サンプルの間は true にする。
   * カテゴリ・詳細ページに「サンプルデータ」である旨の注意書きを表示する。
   */
  sampleData: true,
  locale: 'ja_JP',
  lang: 'ja',
} as const;

export type SiteConfig = typeof siteConfig;
