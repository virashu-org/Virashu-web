import type { ClientPerspective, QueryParams } from '@sanity/client';
import { sanityClient } from 'sanity:client';

const token = import.meta.env.SANITY_API_READ_TOKEN;

function parsePerspective(raw: string | undefined): ClientPerspective | undefined {
  if (!raw) return undefined;
  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith('[')) {
    try {
      return JSON.parse(decoded) as ClientPerspective;
    } catch {
      return undefined;
    }
  }
  return decoded as ClientPerspective;
}

/**
 * Central fetch helper. In published mode it uses the CDN with no token and no
 * stega. In draft mode (a perspective cookie is present) it reads drafts with
 * stega encoding and source maps so the visual-editing overlays can map DOM
 * text back to Studio fields.
 *
 * Published-mode failures degrade to `null` so the site keeps rendering from its
 * fallbacks (src/data/site.ts) before a Sanity project is configured. Draft-mode
 * failures are re-thrown, because a broken preview should be visible.
 */
export async function loadQuery<QueryResponse>({
  query,
  params,
  perspectiveCookie = undefined,
}: {
  query: string;
  params?: QueryParams;
  perspectiveCookie?: string | undefined;
}): Promise<{ data: QueryResponse | null; perspective: ClientPerspective }> {
  const draftMode = perspectiveCookie ? true : false;

  if (draftMode && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required during Visual Editing.',
    );
  }

  const perspective: ClientPerspective = draftMode
    ? (parsePerspective(perspectiveCookie) ?? 'drafts')
    : 'published';

  try {
    const { result } = await sanityClient.fetch<QueryResponse>(query, params ?? {}, {
      filterResponse: false,
      perspective,
      resultSourceMap: draftMode ? 'withKeyArraySelector' : false,
      stega: draftMode,
      ...(draftMode ? { token } : {}),
    });
    return { data: result, perspective };
  } catch (error) {
    if (draftMode) throw error;
    console.warn('[sanity] Query failed; rendering without CMS content.', error);
    return { data: null, perspective };
  }
}
