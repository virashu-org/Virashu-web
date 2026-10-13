import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { sanityClient } from 'sanity:client';

/**
 * Draft-mode bridge. The Studio's Presentation tool calls this route with an
 * authenticated preview URL; we verify the shared secret, set the perspective
 * cookie, and redirect into the site with drafts active.
 */
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (!token) {
    return new Response('Server misconfigured: missing read token', { status: 500 });
  }

  const clientWithToken = sanityClient.withConfig({ token });
  const {
    isValid,
    redirectTo = '/',
    studioPreviewPerspective,
  } = await validatePreviewUrl(clientWithToken, request.url);

  if (!isValid) {
    return new Response('Invalid secret', { status: 401 });
  }

  // Safari blocks third-party cookies that aren't partitioned. When the
  // Presentation tool loads this route inside a cross-site iframe, add the
  // CHIPS Partitioned attribute so Safari stores the cookie under the Studio's
  // partition. Top-level requests stay unpartitioned so the disable route can
  // still clear them.
  const partitioned =
    request.headers.get('sec-fetch-dest') === 'iframe' &&
    request.headers.get('sec-fetch-site') === 'cross-site';

  cookies.set(perspectiveCookieName, studioPreviewPerspective ?? 'drafts', {
    httpOnly: false,
    sameSite: 'none',
    secure: true,
    path: '/',
    partitioned,
  });

  return redirect(redirectTo, 307);
};
