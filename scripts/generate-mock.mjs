#!/usr/bin/env node
/**
 * モックの生データを生成する（実データ収集前の開発用）。
 *
 *   npm run data:mock            # data/raw/{stores,spots}/mock.json を生成
 *   npm run data:mock -- --force # data/enrichment.json の雛形も上書き生成
 *
 * 浜松市を想定した架空の店舗・施設データ。駅・道路・IC名は実在のものを使うが、店舗名・番地・料金等は架空。
 * 電話番号は 000 始まり、URL は example.com（予約ドメイン）を使用。
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

/**
 * 浜松市内のエリア。駅・道路・ICは実在の名称を使い、地域文脈（localNote）の自動抽出を検証できるようにしている。
 * hint が店舗名に含まれる場合、そのエリアに配置する。
 */
const AREAS = [
  { hint: '駅南', ward: '中央区', town: '砂山町', station: '浜松駅', road: '国道257号', ic: '浜松IC' },
  { hint: '鍛冶町', ward: '中央区', town: '鍛冶町', station: '第一通り駅', road: '鍛冶町通り', ic: '浜松IC' },
  { hint: '高塚', ward: '中央区', town: '高塚町', station: '高塚駅', road: '浜松バイパス', ic: '浜松西IC' },
  { hint: '入野', ward: '中央区', town: '入野町', station: '高塚駅', road: '浜松環状線', ic: '浜松西IC' },
  { hint: '上島', ward: '中央区', town: '上島', station: '上島駅', road: '国道152号', ic: '浜松IC' },
  { hint: '浜北', ward: '浜名区', town: '小松', station: '小松駅', road: '国道152号', ic: '浜松浜北IC' },
  { hint: '舞阪', ward: '中央区', town: '舞阪町舞阪', station: '舞阪駅', road: '浜名バイパス', ic: '浜松西IC' },
];

const toFullWidth = (s) => s.replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
const yes = (p) => rand() < p;
const price = (min, max, step = 100) => Math.round(int(min, max) / step) * step;
/** 価格帯の文字列（例: 「6,800〜12,000円」）。スクレイピング結果に多い表記を再現する */
const priceRange = (min, max, step = 100) => {
  const low = price(min, max, step);
  const high = low + price(min * 0.3, min, step);
  return `${low.toLocaleString()}〜${high.toLocaleString()}円`;
};

/**
 * カテゴリごとのテンプレート。
 *   access: station=駅近型 / road=郊外ロードサイド型 / mixed=両方
 *   specs:  比較軸（src/data/categories.ts の axes）の値。駅徒歩・駐車場は build-data で自動算出する
 * スクレイピング結果に近づけるため、一部は「7,678円」「あり」のような文字列で出力している。
 */
const TEMPLATES = {
  gym: {
    access: 'mixed',
    hours: ['24時間営業（スタッフ在籍 10:00～19:00）', '10:00～23:00（日祝は20:00まで）', '7:00～23:00 / 第3月曜休'],
    items: [
      ['24h FIT 浜松駅南店', '24時間ジム', { open24h: true }],
      ['フィットネスクラブ アクティオ高塚', '総合フィットネス', {}],
      ['浜松市民スポーツセンター トレーニング室', '公営ジム', { monthlyFee: 2000 }],
      ['パーソナルジム BODY LAB 鍛冶町', 'パーソナルジム', { monthlyFee: 29800 }],
      ['女性専用ジム ラフィネ浜北', '女性専用ジム', { womenOnly: true }],
      ['ゴールドフィット 入野店', '24時間ジム', { open24h: true }],
    ],
    specs: (o) => ({
      monthlyFee: o.monthlyFee ?? (yes(0.4) ? priceRange(3300, 8800) : `${price(3300, 9800).toLocaleString()}円～`),
      trial: yes(0.7) ? 'あり' : 'なし',
      open24h: o.open24h ?? false,
      womenOnly: o.womenOnly ?? yes(0.4),
    }),
    desc: (n, g) => `${g}。${n}は仕事帰りにも通いやすい立地で、初めての方向けの体験プランもあります。`,
  },
  'car-sell': {
    access: 'road',
    hours: ['10:00～19:00 / 水曜定休', '9:30～18:30 / 年中無休', '10:00～20:00'],
    items: [
      ['カーバイ 浜松バイパス高塚店', '買取専門店', {}],
      ['クルマ買取ナビ 浜北店', '買取専門店', {}],
      ['遠州オートセンター 上島', '中古車販売・買取', {}],
      ['マイカーリンク 入野店', '買取・販売', {}],
      ['輸入車買取 MOTOR GATE 浜松', '輸入車専門', {}],
    ],
    specs: () => ({ kind: '実店舗買取', assessmentFee: 0, homeVisit: yes(0.8), onlineApply: yes(0.7), noReduction: null }),
    desc: (n, g) => `${n}（${g}）。出張査定にも対応しており、来店予約で待ち時間なく査定できます。`,
  },
  'kids-school': {
    access: 'station',
    hours: ['平日 14:00～20:00 / 土 9:00～17:00', '15:00～21:00 / 日曜休', '10:00～19:00 / 月曜休'],
    items: [
      ['キッズ英会話 Little Lake 駅南', '英会話', {}],
      ['プログラミング教室 テックキッズ高塚', 'プログラミング', { ageFrom: 6 }],
      ['浜松スイミングスクール 上島', 'スイミング', { ageFrom: 3 }],
      ['そろばん・算数教室 みらい塾 浜北', 'そろばん', { ageFrom: 5 }],
      ['キッズダンススタジオ STEP 鍛冶町', 'ダンス', {}],
    ],
    specs: (o) => ({
      monthlyFee: yes(0.5) ? priceRange(5500, 11000) : price(5500, 14000),
      trial: yes(0.85),
      ageFrom: o.ageFrom ?? int(2, 6),
      pickup: yes(0.3),
    }),
    desc: (n, g) => `${g}の教室。${n}では無料体験レッスンを随時受け付けています。`,
  },
  internet: {
    access: 'station',
    hours: ['10:00～20:00', '10:00～19:00 / 不定休'],
    items: [
      ['光回線相談カウンター 浜松駅南店', '回線相談窓口', {}],
      ['遠州ケーブルネット 本社窓口', 'ケーブルテレビ・光回線', {}],
      ['家電のハママツ 高塚店 通信コーナー', '家電量販店', {}],
      ['スマホ&光 相談ショップ 浜北店', 'キャリアショップ', {}],
    ],
    specs: () => ({ lineType: 'コラボ光', feeHouse: price(5200, 6400, 10), feeMansion: price(3800, 4800, 10), maxSpeedGbps: yes(0.3) ? 10 : 1, noConstruction: false }),
    desc: (n, g) => `${n}（${g}）。提供エリアの確認や乗り換え相談を対面で受けられます。`,
  },
  energy: {
    access: 'station',
    hours: ['9:00～17:00 / 土日祝休', '10:00～18:00'],
    items: [
      ['遠州でんき お客さまセンター 鍛冶町', '新電力', {}],
      ['浜松ガス サービスショップ 上島', 'ガス', {}],
      ['でんきの相談所 浜北', '新電力 相談窓口', {}],
    ],
    specs: () => ({ kind: '新電力', supplyArea: '中部電力エリア', pricing: '従量制', marketLinked: yes(0.3) }),
    desc: (n, g) => `${g}の窓口。${n}では料金プランのシミュレーションができます。`,
  },
  moving: {
    access: 'road',
    hours: ['8:00～20:00 / 年中無休', '9:00～18:00 / 日曜休'],
    items: [
      ['遠州引越センター 高塚', '引越し', {}],
      ['レイクサイド引越サービス 入野', '引越し', {}],
      ['エコ回収 浜北', '不用品回収', { disposal: true }],
      ['浜松クリーンサービス 上島', '不用品回収', { disposal: true }],
    ],
    specs: (o) => ({ kind: '引越し業者', estimateFee: 0, single: yes(0.7), family: yes(0.7), disposal: o.disposal ?? yes(0.5) }),
    desc: (n, g) => `${n}（${g}）。市内の近距離引越しや単身パックの見積もりに対応しています。`,
  },
  'car-rental': {
    access: 'mixed',
    hours: ['8:00～20:00', '7:00～22:00', '8:00～19:00 / 年末年始休'],
    items: [
      ['浜松レンタカー 駅南店', 'レンタカー', {}],
      ['エンシューレンタカー 鍛冶町営業所', 'レンタカー', {}],
      ['レイクレンタカー 舞阪店', 'レンタカー', {}],
      ['格安レンタカー ワンズ高塚', '格安レンタカー', {}],
      ['エコノレンタ 浜北店', 'レンタカー', {}],
    ],
    specs: () => ({ kind: 'レンタカー', dayFee: yes(0.5) ? priceRange(4800, 9000) : price(4800, 12000), oneWay: yes(0.5) }),
    desc: (n, g) => `${g}。${n}は乗り捨てやチャイルドシートの貸し出しにも対応しています。`,
  },
  hotel: {
    access: 'station',
    hours: ['チェックイン 15:00 / チェックアウト 11:00', 'チェックイン 14:00 / チェックアウト 10:00'],
    items: [
      ['ホテル浜松シティ 駅南', 'シティホテル', {}],
      ['ビジネスホテル ポートイン 鍛冶町', 'ビジネスホテル', {}],
      ['天然温泉 ホテルはままつ湯 駅南', 'ビジネスホテル（大浴場あり）', { largeBath: true }],
      ['湖畔の宿 しおさい 舞阪', '温泉旅館', { largeBath: true }],
      ['ゲストハウス LAKE BASE 鍛冶町', 'ゲストハウス', { largeBath: false }],
    ],
    specs: (o) => ({ kind: 'ホテル', onsen: o.largeBath ?? yes(0.3) }),
    desc: (n, g) => `${g}。${n}は観光・出張どちらの拠点にも便利です。`,
  },
  'rainy-day': {
    access: 'mixed',
    hours: ['9:30～17:00 / 月曜休館', '10:00～21:00', '9:00～18:00 / 第2火曜休'],
    items: [
      ['はままつサイエンスラボ 駅南', '科学館', { admission: 600 }],
      ['浜名湖アクアミュージアム 舞阪', '水族館', { admission: 1500 }],
      ['こども未来館 上島', '児童館（無料）', { admission: '無料' }],
      ['ショッピングモール はままつテラス 入野', '商業施設', { admission: 0 }],
      ['浜松ものづくり歴史館 鍛冶町', '博物館', { admission: 400 }],
    ],
    specs: (o) => ({ kind: '屋内施設', admission: o.admission, noReservation: yes(0.8) }),
    desc: (n, g) => `屋内で過ごせる${g}。${n}は雨の日でも子どもと一緒に楽しめます。`,
  },
  'express-bus': {
    access: 'station',
    hours: ['発車 22:30（東京行）', '発車 23:10（大阪行）', '窓口 9:00～23:30'],
    items: [
      ['浜松駅 高速バスのりば（駅南）', '高速バス乗り場', {}],
      ['浜松バイパス高塚 高速バス停', '高速バス乗り場', {}],
      ['遠州交通 高速バス予約センター 鍛冶町', '予約窓口', {}],
    ],
    specs: () => ({ kind: '高速バス', fareTokyo: price(3000, 6500), seatType: yes(0.5) ? '3列独立シート' : '4列シート', night: yes(0.6) }),
    desc: (n, g) => `${g}。${n}から東京・大阪方面への夜行便が発着します。`,
  },
  gourmet: {
    access: 'station',
    hours: ['11:00～15:00 / 17:00～22:00', '11:30～14:30 / 水曜休', '17:00～24:00 / 日曜休'],
    items: [
      ['うなぎ処 湖東 駅南', 'うなぎ', { budget: 3500 }],
      ['浜松餃子 まるはち 鍛冶町', '浜松餃子', { budget: 800 }],
      ['炉端焼き いさり火 鍛冶町', '居酒屋', { budget: 3000 }],
      ['ベーカリー LAKE SALT 高塚', 'パン・カフェ', { budget: 600 }],
      ['舞阪漁港 食堂 しらす亭', 'しらす丼', { budget: 1200 }],
    ],
    specs: (o) => ({ dishType: 'ご当地グルメ', budgetLunch: o.budget, budgetDinner: `${o.budget.toLocaleString()}〜${(o.budget * 2).toLocaleString()}円`, netReservation: yes(0.6) }),
    desc: (n, g) => `地元で人気の${g}。${n}は観光客にも入りやすい雰囲気です。`,
  },
  parking: {
    access: 'road',
    hours: ['24時間', '7:00～23:00'],
    items: [
      ['浜松駅南パーキング', '立体駐車場', { open24h: true }],
      ['コインパーク鍛冶町第2', 'コインパーキング', { open24h: true }],
      ['高塚パーク&ライド駐車場', 'パーク&ライド', {}],
      ['浜北公園駐車場', '公営駐車場', {}],
    ],
    specs: (o) => ({ maxDaily: price(500, 1800), capacity: int(20, 400), open24h: o.open24h ?? false }),
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

  tpl.items.forEach(([name, genre, options], i) => {
    const area = AREAS.find((a) => name.includes(a.hint)) ?? pick(AREAS);
    const chome = `${int(1, 5)}丁目${int(1, 30)}-${int(1, 20)}`;
    const address = `静岡県浜松市${area.ward}${area.town}${rand() < 0.3 ? toFullWidth(chome) : chome}`;
    datasets[dataset].push({
      name,
      category: category.slug,
      genre,
      address,
      tel: rand() < 0.9 ? buildTel() : null,
      hours: pick(tpl.hours),
      access: buildAccess(tpl.access, area),
      officialUrl: rand() < 0.85 ? `https://example.com/hamamatsu/${category.slug}/${i + 1}` : null,
      description: tpl.desc(name, genre),
      specs: tpl.specs(options),
      source: 'mock',
      fetchedAt,
    });

    // 人手による補正の例: 各カテゴリ先頭2件にサンプルのアフィリエイトリンク、先頭1件に地域文脈メモ
    if (i < 2) {
      enrichmentSeed[makeId(category.slug, name, toHalfWidth(address))] = {
        _name: name,
        affiliate: { url: `https://example.com/aff/${category.slug}/${i + 1}`, program: 'サンプルASP' },
        ...(i === 0 && {
          localNote: [
            { type: 'landmark', text: `${pick(['市役所', '中央図書館', '郵便局', 'イオン'])}の近く` },
            { type: 'tip', text: pick(['平日夜は混みやすいので土日午前が狙い目', '朝夕は浜松バイパスの渋滞に注意', '遠鉄電車なら駅から歩いてすぐ']) },
          ],
        }),
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
