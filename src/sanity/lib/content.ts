import type { AstroCookies } from 'astro';
import { loadQuery } from './load-query';
import { getDraftModeProps } from './draft-mode';
import { PRODUCTS_QUERY, PRODUCT_QUERY, VERTICALS_QUERY } from './queries';
import type {
  PRODUCTS_QUERY_RESULT,
  PRODUCT_QUERY_RESULT,
  VERTICALS_QUERY_RESULT,
} from '../sanity.types';
import { verticals as fallbackVerticals } from '../../data/site';
import type { Vertical } from '../../lib/types';

/**
 * Reads content collections with a graceful fallback to src/data/site.ts, so
 * existing pages keep rendering while the Sanity dataset is being populated.
 */

export async function getVerticals(cookies: AstroCookies): Promise<Vertical[]> {
  const { data } = await loadQuery<VERTICALS_QUERY_RESULT>({
    query: VERTICALS_QUERY,
    ...getDraftModeProps(cookies),
  });

  const verticals = (data ?? []).flatMap((item) =>
    item?.name
      ? [
          {
            name: item.name,
            status: (item.status ?? 'mandate') as Vertical['status'],
            summary: item.summary ?? '',
            objectClause: item.objectClause ?? '',
            items: item.items ?? [],
          },
        ]
      : [],
  );

  return verticals.length ? verticals : (fallbackVerticals as Vertical[]);
}

export async function getProducts(cookies: AstroCookies): Promise<PRODUCTS_QUERY_RESULT> {
  const { data } = await loadQuery<PRODUCTS_QUERY_RESULT>({
    query: PRODUCTS_QUERY,
    ...getDraftModeProps(cookies),
  });
  return data ?? [];
}

export async function getProduct(
  cookies: AstroCookies,
  slug: string,
): Promise<PRODUCT_QUERY_RESULT> {
  const { data } = await loadQuery<PRODUCT_QUERY_RESULT>({
    query: PRODUCT_QUERY,
    params: { slug },
    ...getDraftModeProps(cookies),
  });
  return data ?? null;
}
