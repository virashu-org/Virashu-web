// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * Canonical origin, resolved in this order:
 *   1. SITE_URL        - set this to the production domain once it is live.
 *   2. VERCEL_URL      - set automatically by Vercel on every deployment, so
 *                        preview builds emit canonicals pointing at themselves
 *                        rather than at a domain that may not resolve yet.
 *   3. the placeholder below.
 *
 * This matters because every canonical, og:url and the Organization JSON-LD are
 * built from it. Hard-coding the production domain would make every preview
 * deployment advertise a URL it is not served from.
 */
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.virashu.com');

export default defineConfig({
  site,
  vite: {
    plugins: [tailwindcss()],
  },
});
