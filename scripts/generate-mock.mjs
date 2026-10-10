#!/usr/bin/env node
/**
 * モックの生データを生成する（実データ収集前の開発用）。
 *
 *   npm run data:mock            # data/raw/{stores,spots}/mock.json を生成
 *   npm run data:mock -- --force # data/enrichment.json の雛形も上書き生成
 *
 * 架空都市「みなと市」の架空データ。電話番号は 000 始まり、URL は example.com（予約ドメイン）を使用。
 * スクレイピング結果に近づけるため、全角数字や表記ゆれをあえて混ぜている（build-data で正規化される）。
 */
import path from 'node:path';
import { categories } from '../src/data/categories.ts';
import { paths, DATASETS } from './lib/paths.mjs';
import { exists, today, writeJson } from './lib/io.mjs';
import { makeId, toHalfWidth } from './lib/normalize.mjs';

const force = process.argv.includes('--force');

// 決定的な疑似乱数（実行ごとに結果が変わらないようにする）
let seed = 20261010;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));

const AREAS = [
  { town: '中央', station: 'みなと駅', road: 'みなと中央通り', ic: 'みなと中央IC' },
  { town: '港南', station: '港南駅', road: '臨港バイパス', ic: 'みなと南IC' },
  { town: '北町', station: '北みなと駅', road: '国道99号', ic: 'みなと北IC' },
  { town: '東浜', station: '東浜駅', road: '東浜街道', ic: 'みなと南IC' },
  { town: '緑ヶ丘', station: '緑ヶ丘駅', road: 'みなと環状線', ic: 'みなと北IC' },
];

const toFullWidth = (s) => s.replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));

/**
 * カテゴリごとのテンプレート。
 * access: station=駅近型 / road=郊外ロードサイド型 / mixed=両方
 */
const TEMPLATES = {
  gym: {
    access: 'mixed',
    hours: ['24時間営業（スタッフ在籍 10:00～19:00）', '10:00～23:00（日祝は20:00まで）', '7:00～23:00 / 第3月曜休'],
    items: [
      ['24h FIT みなと中央店', '24時間ジム'],
      ['フィットネスクラブ アクティオ港南', '総合フィットネス'],
      ['みなと市総合体育館 トレーニングルーム', '公営ジム'],
      ['パーソナルジム BODY LAB 北町', 'パーソナルジム'],
      ['女性専用ジム ラフィネ緑ヶ丘', '女性専用ジム'],
    ],
    desc: (n, g) => `${g}。${n}は仕事帰りにも通いやすい立地で、初めての方向けの体験プランもあります。`,
  },
  'car-buyback': {
    access: 'road',
    hours: ['10:00～19:00 / 水曜定休', '9:30～18:30 / 年中無休', '10:00～20:00'],
    items: [
      ['カーバイ みなとバイパス店', '買取専門店'],
      ['クルマ買取ナビ 港南店', '買取専門店'],
      ['みなとオートセンター', '中古車販売・買取'],
      ['マイカーリンク 北町店', '買取・販売'],
      ['輸入車買取 MOTOR GATE', '輸入車専門'],
    ],
    desc: (n, g) => `${n}（${g}）。出張査定にも対応しており、来店予約で待ち時間なく査定できます。`,
  },
  'kids-school': {
    access: 'station',
    hours: ['平日 14:00～20:00 / 土 9:00～17:00', '15:00～21:00 / 日曜休', '10:00～19:00 / 月曜休'],
    items: [
      ['キッズ英会話 Little Harbor', '英会話'],
      ['プログラミング教室 テックキッズ港南', 'プログラミング'],
      ['みなとスイミングスクール', 'スイミング'],
      ['そろばん・算数教室 みらい塾', 'そろばん'],
      ['キッズダンススタジオ STEP', 'ダンス'],
    ],
    desc: (n, g) => `${g}の教室。${n}では無料体験レッスンを随時受け付けています。`,
  },
  fiber: {
    access: 'station',
    hours: ['10:00～20:00', '10:00～19:00 / 不定休'],
    items: [
      ['光回線相談カウンター みなと駅前店', '回線相談窓口'],
      ['ケーブルテレビみなと 本社窓口', 'ケーブルテレビ・光回線'],
      ['家電のミナト 港南店 通信コーナー', '家電量販店'],
      ['スマホ&光 相談ショップ 北町店', 'キャリアショップ'],
    ],
    desc: (n, g) => `${n}（${g}）。提供エリアの確認や乗り換え相談を対面で受けられます。`,
  },
  energy: {
    access: 'station',
    hours: ['9:00～17:00 / 土日祝休', '10:00～18:00'],
    items: [
      ['みなと電力 お客さまセンター', '地域電力'],
      ['みなとガス ショールーム', '都市ガス'],
      ['でんきの相談所 緑ヶ丘', '新電力 相談窓口'],
    ],
    desc: (n, g) => `${g}の窓口。${n}では料金プランのシミュレーションができます。`,
  },
  moving: {
    access: 'road',
    hours: ['8:00～20:00 / 年中無休', '9:00～18:00 / 日曜休'],
    items: [
      ['みなと引越センター', '引越し'],
      ['ハーバー引越サービス', '引越し'],
      ['エコ回収みなと', '不用品回収'],
      ['みなと市 粗大ごみ受付センター', '公的窓口'],
    ],
    desc: (n, g) => `${n}（${g}）。市内の近距離引越しや単身パックの見積もりに対応しています。`,
  },
  'rental-car': {
    access: 'mixed',
    hours: ['8:00～20:00', '7:00～22:00', '8:00～19:00 / 年末年始休'],
    items: [
      ['みなとレンタカー 駅前店', 'レンタカー'],
      ['ポートレンタカー 港南営業所', 'レンタカー'],
      ['シーサイドレンタカー 東浜店', 'レンタカー'],
      ['格安レンタカー ワンズ北町', '格安レンタカー'],
      ['エコノレンタ 緑ヶ丘店', 'レンタカー'],
    ],
    desc: (n, g) => `${g}。${n}は乗り捨てやチャイルドシートの貸し出しにも対応しています。`,
  },
  hotel: {
    access: 'station',
    hours: ['チェックイン 15:00 / チェックアウト 11:00', 'チェックイン 14:00 / チェックアウト 10:00'],
    items: [
      ['ホテルみなとシティ', 'シティホテル'],
      ['ビジネスホテル ポートイン', 'ビジネスホテル'],
      ['天然温泉 ホテルみなと湯', 'ビジネスホテル（大浴場あり）'],
      ['港の湯 旅館 しおさい', '温泉旅館'],
      ['ゲストハウス HARBOR BASE', 'ゲストハウス'],
    ],
    desc: (n, g) => `${g}。${n}は観光・出張どちらの拠点にも便利です。`,
  },
  'rainy-day': {
    access: 'mixed',
    hours: ['9:30～17:00 / 月曜休館', '10:00～21:00', '9:00～18:00 / 第2火曜休'],
    items: [
      ['みなと市立科学館', '科学館'],
      ['みなと水族館 アクアポート', '水族館'],
      ['こども未来館', '児童館（無料）'],
      ['ショッピングモール みなとテラス', '商業施設'],
      ['みなと歴史博物館', '博物館'],
    ],
    desc: (n, g) => `屋内で過ごせる${g}。${n}は雨の日でも子どもと一緒に楽しめます。`,
  },
  'night-bus': {
    access: 'station',
    hours: ['発車 22:30（東京行）', '発車 23:10（大阪行）', '窓口 9:00～23:30'],
    items: [
      ['みなと駅前バスターミナル', '高速バス乗り場'],
      ['港南高速バス停', '高速バス乗り場'],
      ['みなと交通 高速バス予約センター', '予約窓口'],
    ],
    desc: (n, g) => `${g}。${n}から東京・大阪方面への夜行便が発着します。`,
  },
  gourmet: {
    access: 'station',
    hours: ['11:00～15:00 / 17:00～22:00', '11:30～14:30 / 水曜休', '17:00～24:00 / 日曜休'],
    items: [
      ['港町食堂 うみかぜ', '海鮮丼'],
      ['みなとラーメン 本店', 'ご当地ラーメン'],
      ['炉端焼き いさり火', '居酒屋'],
      ['ベーカリー SEA SALT', 'パン・カフェ'],
      ['みなと朝市 食堂街', '市場食堂'],
    ],
    desc: (n, g) => `地元で人気の${g}。${n}は観光客にも入りやすい雰囲気です。`,
  },
  parking: {
    access: 'road',
    hours: ['24時間', '7:00～23:00'],
    items: [
      ['みなと中央パーキング', '立体駐車場'],
      ['コインパーク港南第2', 'コインパーキング'],
      ['市営 東浜パーク&ライド駐車場', 'パーク&ライド'],
      ['北町公園駐車場', '公営駐車場'],
    ],
    desc: (n, g) => `${g}。${n}は中心市街地へのアクセスに便利です。`,
  },
};

function buildAccess(style, area) {
  const walk = int(2, 15);
  const station = rand() < 0.5 ? `${area.station}から徒歩${walk}分` : `${area.station} 徒歩${toFullWidth(String(walk))}分`;
  const road = `${area.road}沿い`;
  const parking = rand() < 0.6 ? `${rand() < 0.5 ? '無料' : ''}駐車場${int(10, 120)}台` : '駐車場なし';
  const car = `${area.ic}から車で${int(3, 15)}分`;
  if (style === 'station') return rand() < 0.7 ? station : `${station}／${parking}`;
  if (style === 'road') return rand() < 0.5 ? `${road}・${parking}` : `${road}（${car}）`;
  return rand() < 0.5 ? `${station}・${parking}` : `${road}／${station}`;
}

let telSeq = 1;
function buildTel() {
  const n = String(telSeq++).padStart(4, '0');
  // 表記ゆれを混ぜる（ハイフンなし・全角）
  const r = rand();
  if (r < 0.2) return `000000${n}`;
  if (r < 0.3) return toFullWidth(`000-000-${n}`);
  return `000-000-${n}`;
}

const datasets = { stores: [], spots: [] };
const enrichmentSeed = {};
const fetchedAt = today();

for (const category of categories) {
  const tpl = TEMPLATES[category.slug];
  if (!tpl) continue;
  const dataset = Object.entries(DATASETS).find(([, section]) => section === category.section)[0];

  tpl.items.forEach(([name, genre], i) => {
    const area = AREAS.find((a) => name.includes(a.town)) ?? pick(AREAS);
    const chome = `${int(1, 5)}丁目${int(1, 30)}-${int(1, 20)}`;
    const address = `〇〇県みなと市${area.town}${rand() < 0.3 ? toFullWidth(chome) : chome}`;
    datasets[dataset].push({
      name,
      category: category.slug,
      genre,
      address,
      tel: rand() < 0.9 ? buildTel() : null,
      hours: pick(tpl.hours),
      access: buildAccess(tpl.access, area),
      officialUrl: rand() < 0.85 ? `https://example.com/minato/${category.slug}/${i + 1}` : null,
      description: tpl.desc(name, genre),
      source: 'mock',
      fetchedAt,
    });

    // 人手による地域文脈メモの例（各カテゴリの先頭データのみ）
    if (i === 0) {
      enrichmentSeed[makeId(category.slug, name, toHalfWidth(address))] = {
        _name: name,
        localNote: [
          { type: 'landmark', text: `${pick(['中央公園', '市立図書館', '郵便局', '市民病院'])}の向かい` },
          { type: 'tip', text: pick(['平日夜は混みやすいので土日午前が狙い目', '駅の東口から出ると近い', '冬場は路面凍結に注意']) },
        ],
      };
    }
  });
}

for (const [name, items] of Object.entries(datasets)) {
  const file = path.join(paths.raw[name], 'mock.json');
  await writeJson(file, items);
  console.log(`✔ ${path.relative(paths.root, file)}: ${items.length}件`);
}

if (force || !(await exists(paths.enrichment))) {
  await writeJson(paths.enrichment, enrichmentSeed);
  console.log(`✔ ${path.relative(paths.root, paths.enrichment)}: ${Object.keys(enrichmentSeed).length}件（雛形）`);
} else {
  console.log(`- ${path.relative(paths.root, paths.enrichment)} は既存のため保持しました（上書きは --force）`);
}
