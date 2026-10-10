import type { Category } from '@/data/categories';
import type { Place } from '@/data/places';
import { siteConfig } from '@/config/site.config';

/** CTA文言の {station} などを都市設定で置き換える */
const fill = (text: string) => text.replaceAll('{station}', siteConfig.city.mainStation);

/** 店舗のCTA（アフィリエイトの個別文言 → カテゴリ既定文言の順で採用） */
export function resolveCta(category: Category, place?: Pick<Place, 'affiliate'>) {
  return {
    label: fill(place?.affiliate?.label ?? category.cta.label),
    microcopy: fill(category.cta.microcopy),
  };
}
