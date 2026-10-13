import { defineQuery } from 'groq';

/**
 * All GROQ queries live here so `sanity typegen` can generate result types for
 * them (see sanity.cli.ts). Image fields are projected raw, so the returned
 * object keeps `asset._ref` (which `urlFor` needs) and any `alt` text.
 */

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  brandName,
  legalName,
  tagline,
  organizationDescription,
  logo,
  founders[]{ name, role, derivation, meaning },
  markMeanings[]{ title, sanskrit, body },
  legal{
    cin, gstin, registeredOffice, city, email, phone,
    grievanceOfficer{ name, designation, email, acknowledgementWindow, resolutionWindow }
  },
  nav[]{ label, href },
  footer[]{ heading, links[]{ label, href, newTab } },
  social[]{ platform, url },
  defaultSeo{ metaTitle, metaDescription, ogImage, canonicalOverride, noIndex, keywords, schemaType, structuredData }
}`);

export const VERTICALS_QUERY = defineQuery(`*[_type == "vertical"] | order(order asc, name asc){
  _id, name, status, summary, objectClause, items
}`);

export const PRODUCTS_QUERY = defineQuery(`*[_type == "product"] | order(name asc){
  _id, name, "slug": slug.current, tagline, category, status, summary
}`);

export const PRODUCT_QUERY = defineQuery(`*[_type == "product" && slug.current == $slug][0]{
  _id, _updatedAt, name, "slug": slug.current, tagline, category, market, promise, status, objectClause,
  summary, problem, heroImage, logo,
  mechanic[]{ step, body },
  features[]{ title, body },
  audiences[]{ name, body, points },
  stack[]{ group, items },
  sections[],
  seo
}`);

export const PRODUCT_SLUGS_QUERY = defineQuery(`*[_type == "product" && defined(slug.current)]{
  "slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex
}`);

export const POSTS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
  _id, title, "slug": slug.current, excerpt, coverImage, publishedAt,
  author->{ name, role },
  categories[]->{ title, "slug": slug.current }
}`);

export const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id, _updatedAt, title, "slug": slug.current, excerpt, coverImage, publishedAt, updatedAt,
  body[],
  author->{ name, role, image, bio },
  categories[]->{ title, "slug": slug.current },
  "related": relatedPosts[]->{ _id, title, "slug": slug.current, excerpt, coverImage, publishedAt },
  seo
}`);

export const POST_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex
}`);

export const CASE_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy" && defined(slug.current)] | order(publishedAt desc){
  _id, title, "slug": slug.current, client, industry, summary, coverImage, publishedAt, services
}`);

export const CASE_STUDY_QUERY = defineQuery(`*[_type == "caseStudy" && slug.current == $slug][0]{
  _id, _updatedAt, title, "slug": slug.current, client, industry, summary, coverImage, publishedAt,
  body[], metrics[]{ value, label }, services, gallery,
  testimonial{ quote, author, role },
  seo
}`);

export const CASE_STUDY_SLUGS_QUERY = defineQuery(`*[_type == "caseStudy" && defined(slug.current)]{
  "slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex
}`);

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id, _updatedAt, title, "slug": slug.current, eyebrow, lede, sections[], seo
}`);

export const PAGE_SLUGS_QUERY = defineQuery(`*[_type == "page" && defined(slug.current)]{
  "slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex
}`);

export const LEGAL_PAGE_QUERY = defineQuery(`*[_type == "legalPage" && slug.current == $slug][0]{
  _id, _updatedAt, title, "slug": slug.current, eyebrow, lede, lastUpdated, body[], seo
}`);

export const SITEMAP_QUERY = defineQuery(`{
  "posts": *[_type == "post" && defined(slug.current)]{"slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex},
  "caseStudies": *[_type == "caseStudy" && defined(slug.current)]{"slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex},
  "products": *[_type == "product" && defined(slug.current)]{"slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex},
  "pages": *[_type == "page" && defined(slug.current)]{"slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex},
  "legalPages": *[_type == "legalPage" && defined(slug.current)]{"slug": slug.current, "updatedAt": _updatedAt, "noIndex": seo.noIndex}
}`);
