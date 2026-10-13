import type { AstroCookies } from 'astro';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';

/**
 * Reads the draft-mode perspective cookie (set by /api/draft-mode/enable) and
 * hands it to `loadQuery`. When the cookie is absent the site serves published
 * content; when it is present the query returns drafts with stega encoding.
 */
export function getDraftModeProps(cookies: AstroCookies): {
  perspectiveCookie: string | undefined;
} {
  return {
    perspectiveCookie: cookies.get(perspectiveCookieName)?.value ?? undefined,
  };
}
