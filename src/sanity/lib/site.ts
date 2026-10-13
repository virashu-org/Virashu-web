import type { AstroCookies } from 'astro';
import { loadQuery } from './load-query';
import { SITE_SETTINGS_QUERY } from './queries';
import { getDraftModeProps } from './draft-mode';
import { resolveSiteSettings, type ResolvedSiteSettings } from '../../lib/site-settings';
import type { SITE_SETTINGS_QUERY_RESULT } from '../sanity.types';

/** Fetch and resolve global site settings, draft-aware. */
export async function getSiteSettings(cookies: AstroCookies): Promise<ResolvedSiteSettings> {
  const { data } = await loadQuery<SITE_SETTINGS_QUERY_RESULT>({
    query: SITE_SETTINGS_QUERY,
    ...getDraftModeProps(cookies),
  });
  return resolveSiteSettings(data);
}
