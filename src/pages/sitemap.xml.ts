import type { APIRoute } from 'astro';
import { loadQuery } from '../sanity/lib/load-query';
import { SITEMAP_QUERY } from '../sanity/lib/queries';
import type { SITEMAP_QUERY_RESULT } from '../sanity/sanity.types';

/** Routes that are not backed by a Sanity document. */
const STATIC_PATHS = [
  '/',
  '/group',
  '/hikkari',
  '/about',
  '/careers',
  '/contact',
  '/privacy',
  '/terms',
  '/grievance',
  '/blog',
  '/case-studies',
];

type Entry = { loc: string; lastmod?: string };

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://www.virashu.com')).origin;

  const { data } = await loadQuery<SITEMAP_QUERY_RESULT>({ query: SITEMAP_QUERY });

  const entries: Entry[] = STATIC_PATHS.map((path) => ({ loc: new URL(path, origin).href }));

  const add = (path: string, updatedAt?: string | null, noIndex?: boolean | null) => {
    if (noIndex) return;
    entries.push({ loc: new URL(path, origin).href, lastmod: updatedAt ?? undefined });
  };

  for (const item of data?.posts ?? []) if (item.slug) add(`/blog/${item.slug}`, item.updatedAt, item.noIndex);
  for (const item of data?.caseStudies ?? [])
    if (item.slug) add(`/case-studies/${item.slug}`, item.updatedAt, item.noIndex);
  for (const item of data?.products ?? [])
    if (item.slug) add(`/products/${item.slug}`, item.updatedAt, item.noIndex);
  for (const item of data?.pages ?? []) if (item.slug) add(`/${item.slug}`, item.updatedAt, item.noIndex);
  for (const item of data?.legalPages ?? [])
    if (item.slug) add(`/${item.slug}`, item.updatedAt, item.noIndex);

  const urls = entries
    .map(
      (entry) =>
        `  <url><loc>${entry.loc}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}</url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
