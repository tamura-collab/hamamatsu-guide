import { furusatoServices, type FurusatoService } from '@/data/furusato';

/** 記事本文の <div data-furusato></div> を置き換えるための目印 */
const MARKER = /<div data-furusato(?:="[^"]*")?><\/div>/g;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function serviceLink(s: FurusatoService, label: string, placement: string) {
  const common = `target="_blank" data-category="furusato" data-section="living" data-place-id="furusato-${s.id}" data-placement="${placement}"`;
  return s.affiliate
    ? `<a href="${esc(s.affiliate.url)}" rel="sponsored nofollow noopener noreferrer" data-track="affiliate" ${common}>${label}</a>`
    : `<a href="${esc(s.officialUrl)}" rel="nofollow noopener noreferrer" data-track="official" ${common}>${label}</a>`;
}

function block(withBeacon: boolean) {
  const [main, ...others] = furusatoServices;
  const a = main.affiliate;
  const banner = a?.bannerImageUrl
    ? `<p class="furusato-banner">${serviceLink(main, `<img src="${esc(a.bannerImageUrl)}" alt="${esc(main.name)}" loading="lazy" decoding="async">`, 'article-banner')}</p>`
    : '';
  const beacon = withBeacon && a?.impressionUrl ? `<img border="0" width="1" height="1" src="${esc(a.impressionUrl)}" alt="" class="a8-beacon">` : '';
  const list = others
    .map((s) => `<li>${serviceLink(s, esc(s.name), 'article-furusato')}：${esc(s.summary)}</li>`)
    .join('');
  return `<aside class="furusato-box" aria-label="ふるさと納税でお取り寄せ">
<p class="furusato-title">浜松の味を自宅で楽しむなら「ふるさと納税」も</p>
<p>「浜松餃子」や「浜名湖のうなぎ」は、浜松市のふるさと納税のお礼品にもなっています。寄付額のうち2,000円を超える部分は、上限の範囲内で所得税・住民税から控除されるので、本場の味をお得に取り寄せられます。</p>
${banner}
<p class="article-cta">${serviceLink(main, `${esc(main.name)}で浜松のお礼品を探す`, 'article')}<span class="article-cta-note">${a ? 'PR・' : ''}${esc(main.summary)}</span>${beacon}</p>
<p class="furusato-others-title">ほかのふるさと納税サイト</p>
<ul class="furusato-others">${list}</ul>
<p class="furusato-note">※住んでいる自治体への寄付では、お礼品は受け取れません（浜松市にお住まいの方は浜松市のお礼品の対象外です）。2025年10月から、ふるさと納税サイトによるポイントの付与は禁止されています。</p>
</aside>`;
}

/** 本文中の目印をブロックに置き換える。計測ビーコンは最初のブロックだけに付ける */
export function injectFurusato(html: string) {
  let count = 0;
  return html.replace(MARKER, () => block(count++ === 0));
}
