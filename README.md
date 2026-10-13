# Virashu Web

Astro 7 + Tailwind 4 marketing site, with **Sanity** as the CMS for blogs, case
studies, product/company pages, legal pages and all SEO metadata. The Studio is
a **standalone app in the sibling folder `../studio-higsboson`**; editors get
click-to-edit visual preview through the Presentation tool.

## Stack

| Piece | Choice |
|---|---|
| Framework | Astro 7 (`output: 'server'` + `@astrojs/vercel`) |
| Styling | Tailwind 4 via `@tailwindcss/vite` |
| CMS | Sanity (Content Lake; Studio lives in `../studio-higsboson`) |
| Preview | Presentation tool + cookie draft mode + click-to-edit overlays |

## Repo layout

```
Virashu/                 # parent folder
├── Virashu-web/         # this Astro app
└── studio-higsboson/    # Sanity Studio (separate package, project ymsvmpl7)
```

The Studio is intentionally **not** embedded in the app: it has its own
`package.json`, schema and CLI/TypeGen config, and deploys to Sanity hosting
independently. The app only reads content.

## Editor workflow

1. Start the Studio: `cd ../studio-higsboson && npm run dev` → `http://localhost:3333`.
2. Create or edit a **Blog post**, **Case study**, **Product / business**,
   **Page**, or **Legal page**. Every document has an **SEO & social** tab.
3. Open the **Presentation** tab to see the live page with click-to-edit
   overlays and switch between published and draft content.
4. Publish. Because content routes render on demand (SSR), published changes
   appear immediately; the deploy-hook webhook (below) refreshes cached pages
   and the sitemap.

## One-time setup

1. Sanity project `ymsvmpl7` with a `production` dataset — already wired into
   `../studio-higsboson/sanity.config.ts` and `sanity.cli.ts`.
2. Add CORS origins **with "Allow credentials"**: `http://localhost:4321` (this
   app) and each deployed app origin. The Studio origin `http://localhost:3333`
   is already present.
3. Create an API token with the **Viewer** role (API → Tokens) and put it in this
   app's `.env` as `SANITY_API_READ_TOKEN`.
4. Copy `.env.example` to `.env` and fill in the values, and add the same
   variables to the Vercel project.
5. Seed the initial content from `src/data/site.ts`. Run it from the Studio
   folder, which carries the Sanity CLI config:

   ```
   cd ../studio-higsboson
   npx sanity exec ../Virashu-web/tools/seed.ts --with-user-token
   ```

## Environment variables (this app)

| Variable | Scope | Purpose |
|---|---|---|
| `SITE_URL` | build | Canonical origin (falls back to `VERCEL_URL`, then the placeholder) |
| `PUBLIC_SANITY_PROJECT_ID` | public | Sanity project id (`ymsvmpl7`) |
| `PUBLIC_SANITY_DATASET` | public | Sanity dataset (`production`) |
| `PUBLIC_SANITY_STUDIO_URL` | public | Origin of the standalone Studio, used to build click-to-edit links |
| `SANITY_API_READ_TOKEN` | server-only | Viewer token, required for draft mode / visual editing |

The Studio reads `SANITY_STUDIO_PREVIEW_URL` (the app origin) from its own `.env`
— see `../studio-higsboson/.env.example`.

## Commands (this app)

| Command | Does |
|---|---|
| `npm run dev` | Astro dev server (`http://localhost:4321`) |
| `npm run check` | Astro/TypeScript check |
| `npm run build` | Production build (Vercel output) |

Studio commands live in the Studio folder (`../studio-higsboson`):

| Command | Does |
|---|---|
| `npm run dev` | Sanity Studio (`http://localhost:3333`) |
| `npm run typegen` | Regenerate `../Virashu-web/src/sanity/sanity.types.ts` from schema + queries |
| `npm run schemas:deploy` | Upload the schema to the Content Lake |
| `npm run deploy` | Deploy the Studio to Sanity hosting |

> **Note on installs:** this environment runs npm with `NODE_ENV=production`,
> which makes npm skip `devDependencies`. If `sanity` (used by `tools/seed.ts`),
> `@astrojs/check` or `typescript` go missing, reinstall with
> `npm install --include=dev`.

> **Note on the dev server:** visual editing pulls in `styled-components` (via
> `@sanity/ui`), whose `package.json` has no `exports` map. Vite 7's Rolldown
> optimizer cannot resolve it, so those packages are listed in
> `optimizeDeps.exclude` in `astro.config.mjs`. If you ever see a
> `MISSING_EXPORT "styled"/"css"` error after a dependency bump, clear the cache
> (`rm -rf node_modules/.vite`) and keep the exclusion list intact.

## Content model

Documents: `post`, `caseStudy`, `product`, `page`, `legalPage`, `author`,
`category`, `vertical`. Singleton: `siteSettings`. Reusable objects: `seo`,
`richText`, and the page-builder sections (`sectionHero`, `sectionRichText`,
`sectionFeatureGrid`, `sectionLogoCloud`, `sectionStats`, `sectionTestimonial`,
`sectionCta`, `sectionFaq`, `sectionGallery`, `sectionEmbed`).

## SEO

- Per-document `seo` object (meta title/description, OG image, canonical
  override, `noIndex`, keywords, structured-data type, raw JSON-LD override).
- `siteSettings.defaultSeo` provides site-wide fallbacks.
- `src/components/Seo.astro` emits title, description, canonical, Open Graph,
  Twitter cards, robots, and a JSON-LD `@graph` (Organization, WebSite, page
  type, BreadcrumbList, plus any custom nodes).
- `src/pages/sitemap.xml.ts` builds the sitemap from static routes plus every
  published document; `robots.txt` points at it.

## Rendering

All CMS-driven routes render on demand (SSR) so draft preview works everywhere.
Any page can be made build-time static with `export const prerender = true`,
at the cost of losing in-context preview on that page. `public/` assets and the
sitemap are cached at the edge.

## Publish webhook (recommended)

In Sanity → API → Webhooks, add a webhook on create/update/delete pointing to a
Vercel **Deploy Hook** URL. This refreshes any prerendered output and the
cached sitemap when content changes.
