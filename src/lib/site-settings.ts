import { site as fallback, markMeanings as fallbackMarkMeanings } from '../data/site';
import type { SITE_SETTINGS_QUERY_RESULT } from '../sanity/sanity.types';

export type NavItem = { label: string; href: string };
export type FooterColumn = { heading: string; links: NavItem[] };
export type SocialLink = { platform: string; url: string };
export type MarkMeaning = { title: string; sanskrit: string; body: string };
export type Founder = { name: string; role: string; derivation: string; meaning: string };

export type ResolvedSeo = {
  metaTitle: string | null;
  metaDescription: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ogImage: any | null;
  canonicalOverride: string | null;
  noIndex: boolean;
  keywords: string[];
  schemaType: string;
  structuredData: string | null;
};

export type ResolvedLegal = {
  cin: string;
  gstin: string;
  registeredOffice: string;
  city: string;
  email: string;
  phone: string;
  grievanceOfficer: {
    name: string;
    designation: string;
    email: string;
    acknowledgementWindow: string;
    resolutionWindow: string;
  };
};

export type ResolvedSiteSettings = {
  brandName: string;
  legalName: string;
  tagline: string;
  organizationDescription: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logo: any | null;
  founders: Founder[];
  markMeanings: MarkMeaning[];
  legal: ResolvedLegal;
  nav: NavItem[];
  footer: FooterColumn[];
  social: SocialLink[];
  defaultSeo: ResolvedSeo | null;
};

type Raw = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

function resolveSeo(raw: Raw['defaultSeo']): ResolvedSeo | null {
  if (!raw) return null;
  return {
    metaTitle: raw.metaTitle,
    metaDescription: raw.metaDescription,
    ogImage: raw.ogImage,
    canonicalOverride: raw.canonicalOverride,
    noIndex: raw.noIndex ?? false,
    keywords: raw.keywords ?? [],
    schemaType: raw.schemaType ?? 'WebPage',
    structuredData: raw.structuredData,
  };
}

/**
 * Merges Sanity `siteSettings` over the hard-coded fallbacks in
 * src/data/site.ts. This lets the site render correctly before a Sanity project
 * is populated — every field is optional and falls back to the original copy.
 */
export function resolveSiteSettings(raw: SITE_SETTINGS_QUERY_RESULT): ResolvedSiteSettings {
  const nav = (raw?.nav ?? []).flatMap((item) =>
    item?.label && item?.href ? [{ label: item.label, href: item.href }] : [],
  );

  const footer = (raw?.footer ?? []).flatMap((column) =>
    column?.heading
      ? [
          {
            heading: column.heading,
            links: (column.links ?? []).flatMap((link) =>
              link?.label && link?.href ? [{ label: link.label, href: link.href }] : [],
            ),
          },
        ]
      : [],
  );

  const founders = (raw?.founders ?? []).flatMap((founder) =>
    founder?.name
      ? [
          {
            name: founder.name,
            role: founder.role ?? '',
            derivation: founder.derivation ?? '',
            meaning: founder.meaning ?? '',
          },
        ]
      : [],
  );

  const markMeanings = (raw?.markMeanings ?? []).flatMap((meaning) =>
    meaning?.title
      ? [
          {
            title: meaning.title,
            sanskrit: meaning.sanskrit ?? '',
            body: meaning.body ?? '',
          },
        ]
      : [],
  );

  const social = (raw?.social ?? []).flatMap((link) =>
    link?.platform && link?.url ? [{ platform: link.platform, url: link.url }] : [],
  );

  return {
    brandName: raw?.brandName ?? fallback.brandName,
    legalName: raw?.legalName ?? fallback.legalName,
    tagline: raw?.tagline ?? fallback.tagline,
    organizationDescription: raw?.organizationDescription ?? '',
    logo: raw?.logo ?? null,
    founders: founders.length ? founders : [...fallback.founders],
    markMeanings: markMeanings.length ? markMeanings : [...fallbackMarkMeanings],
    legal: {
      cin: raw?.legal?.cin ?? fallback.legal.cin,
      gstin: raw?.legal?.gstin ?? fallback.legal.gstin,
      registeredOffice: raw?.legal?.registeredOffice ?? fallback.legal.registeredOffice,
      city: raw?.legal?.city ?? fallback.legal.city,
      email: raw?.legal?.email ?? fallback.legal.email,
      phone: raw?.legal?.phone ?? fallback.legal.phone,
      grievanceOfficer: {
        name: raw?.legal?.grievanceOfficer?.name ?? fallback.legal.grievanceOfficer.name,
        designation:
          raw?.legal?.grievanceOfficer?.designation ?? fallback.legal.grievanceOfficer.designation,
        email: raw?.legal?.grievanceOfficer?.email ?? fallback.legal.grievanceOfficer.email,
        acknowledgementWindow:
          raw?.legal?.grievanceOfficer?.acknowledgementWindow ??
          fallback.legal.grievanceOfficer.acknowledgementWindow,
        resolutionWindow:
          raw?.legal?.grievanceOfficer?.resolutionWindow ??
          fallback.legal.grievanceOfficer.resolutionWindow,
      },
    },
    nav: nav.length ? nav : [...fallback.nav],
    footer: footer.length ? footer : (fallback.footer as unknown as FooterColumn[]),
    social,
    defaultSeo: resolveSeo(raw?.defaultSeo ?? null),
  };
}
