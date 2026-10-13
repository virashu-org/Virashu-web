/**
 * One-off seed: pushes the content currently hard-coded in src/data/site.ts into
 * Sanity so editors can take it from there.
 *
 * Safe to re-run — it replaces the siteSettings singleton, the Hikkari product,
 * and the sector documents (deterministic ids), so it will not create duplicates.
 *
 * The Studio lives in the sibling folder ../studio-higsboson, so run this from
 * there (that folder holds the Sanity CLI config):
 *   cd ../studio-higsboson
 *   npx sanity exec ../Virashu-web/tools/seed.ts --with-user-token
 *
 * The user token needs Editor (write) access to the dataset.
 */
import { getCliClient } from 'sanity/cli';
import { site, verticals, hikkari, markMeanings } from '../src/data/site';

const client = getCliClient({
  projectId: 'ymsvmpl7',
  dataset: 'production',
  apiVersion: '2026-03-01',
});

let counter = 0;
const key = () => `seed-${(counter++).toString(36)}`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withKeys = (items: any[]) => items.map((item) => ({ _key: key(), ...item }));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function seed() {
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    brandName: site.brandName,
    legalName: site.legalName,
    tagline: site.tagline,
    organizationDescription:
      'Virashu Private Limited is a parent holding company that operates its own businesses across software, engineering, environment, hospitality and commerce.',
    legal: {
      _type: 'legalInfo',
      cin: site.legal.cin,
      gstin: site.legal.gstin,
      registeredOffice: site.legal.registeredOffice,
      city: site.legal.city,
      email: site.legal.email,
      phone: site.legal.phone,
      grievanceOfficer: {
        _type: 'grievanceOfficer',
        ...site.legal.grievanceOfficer,
      },
    },
    founders: withKeys(site.founders.map((founder) => ({ _type: 'founder', ...founder }))),
    markMeanings: withKeys(markMeanings.map((meaning) => ({ _type: 'markMeaning', ...meaning }))),
    nav: withKeys(site.nav.map((item) => ({ _type: 'navItem', ...item }))),
    footer: withKeys(
      site.footer.map((column) => ({
        _type: 'footerColumn',
        heading: column.heading,
        links: withKeys(column.links.map((link) => ({ _type: 'link', ...link }))),
      })),
    ),
  });

  for (const [index, vertical] of verticals.entries()) {
    await client.createOrReplace({
      _id: `vertical-${slugify(vertical.name)}`,
      _type: 'vertical',
      name: vertical.name,
      status: vertical.status,
      summary: vertical.summary,
      objectClause: vertical.objectClause,
      items: [...vertical.items],
      order: index,
    });
  }

  await client.createOrReplace({
    _id: 'product-hikkari',
    _type: 'product',
    name: hikkari.name,
    slug: { _type: 'slug', current: 'hikkari' },
    category: hikkari.category,
    market: hikkari.market,
    promise: hikkari.promise,
    status: 'operating',
    summary: hikkari.promise,
    problem: hikkari.problem,
    mechanic: withKeys(hikkari.mechanic.map((step) => ({ _type: 'mechanicStep', ...step }))),
    features: withKeys(hikkari.features.map((feature) => ({ _type: 'featureItem', ...feature }))),
    audiences: withKeys(
      hikkari.audiences.map((audience) => ({
        _type: 'audience',
        name: audience.name,
        body: audience.body,
        points: [...audience.points],
      })),
    ),
    stack: withKeys(
      hikkari.stack.map((group) => ({
        _type: 'stackGroup',
        group: group.group,
        items: [...group.items],
      })),
    ),
  });

  console.log(
    'Seed complete: siteSettings, %d sectors, and the Hikkari product are now in Sanity.',
    verticals.length,
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
