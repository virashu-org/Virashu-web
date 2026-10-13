// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

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

// The integration needs the project id and dataset at config time, so they are
// read through Vite's loadEnv rather than import.meta.env.
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? 'development',
  process.cwd(),
  '',
);

// Fallbacks keep `astro dev` / `astro check` working before a Sanity project
// exists. Queries will simply return nothing until real values are supplied.
const projectId = PUBLIC_SANITY_PROJECT_ID || 'placeholder';
const dataset = PUBLIC_SANITY_DATASET || 'production';

// Origin of the standalone Studio (studio-higsboson). The visual-editing
// overlays send editors here to open the field they clicked.
const studioUrl = process.env.PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333';

export default defineConfig({
  site,
  // Server output + Vercel adapter: CMS-driven routes render on demand so the
  // cookie-based draft mode (visual editing) can vary by request. Non-content
  // pages opt back into static rendering with `export const prerender = true`.
  output: 'server',
  adapter: vercel(),
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion: '2026-03-01',
      useCdn: true,
      stega: { studioUrl },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: [
        'react/compiler-runtime',
        'react-is',
        'lodash/isObject.js',
        'lodash/groupBy.js',
        'lodash/keyBy.js',
        'lodash/partition.js',
        'lodash/sortedIndex.js',
      ],
      // The visual-editing overlays pull these in (styled-components via
      // @sanity/ui). Rolldown (Vite 7) fails to resolve styled-components'
      // exports-less package.json while pre-bundling it and aborts the dev
      // server. Serving them un-optimized avoids that; they are already ESM, so
      // the browser can load them directly.
      exclude: ['styled-components', '@sanity/ui', '@sanity/visual-editing'],
    },
  },
});
