/**
 * Single source of truth for site content.
 *
 * IMPORTANT: Every value marked PENDING must be supplied by the company before
 * launch. They render as a visible placeholder on purpose, so an unverified
 * legal fact can never ship silently. To fill them all, search this file for
 * the string "to be added".
 */

const PENDING = "[to be added]" as const;

export const site = {
  brandName: "Virashu",
  legalName: "Virashu Global Private Limited",
  /** Corporate tagline, as it appears in the circular badge. */
  tagline: "Forging Endless Horizons.",

  /** Statutory disclosures. See /grievance and /terms. */
  legal: {
    cin: PENDING,
    gstin: PENDING,
    registeredOffice: PENDING,
    city: "India",
    email: PENDING,
    phone: PENDING,
    grievanceOfficer: {
      name: PENDING,
      designation: "Grievance Officer",
      email: PENDING,
      /** IT Rules, 2021 require acknowledgement within 24h and resolution in 15 days. */
      acknowledgementWindow: "24 hours",
      resolutionWindow: "15 days",
    },
  },

  founders: [
    { name: "Vishal", role: PENDING, derivation: "Vi", meaning: "Vastness and limitless vision" },
    { name: "Ratnesh", role: PENDING, derivation: "ra", meaning: "Precious value and excellence" },
    { name: "Shubham", role: PENDING, derivation: "shu", meaning: "Auspicious growth and vitality" },
  ],

  nav: [
    { label: "The group", href: "/group" },
    { label: "Hikkari", href: "/hikkari" },
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],

  footer: [
    {
      heading: "Group",
      links: [
        { label: "The group", href: "/group" },
        { label: "Hikkari", href: "/hikkari" },
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Privacy policy", href: "/privacy" },
        { label: "Terms of use", href: "/terms" },
        { label: "Grievance redressal", href: "/grievance" },
      ],
    },
  ],
} as const;

/** The four meanings encoded in the corporate mark. */
export const markMeanings = [
  {
    title: "Vastness",
    sanskrit: "Vishal",
    body: "A navy V and S interlock and close at the base, forming the continuous loop the rest of the emblem stands on. Infinite scale, global expansion, endless possibility.",
  },
  {
    title: "Precious value",
    sanskrit: "Ratnesh",
    body: "A faceted geometric diamond sits at the exact focal centre, holding core strength, wealth creation and high-value standards.",
  },
  {
    title: "Auspicious growth",
    sanskrit: "Shubham",
    body: "Three upward-reaching leaf forms rise from the centre, each carrying a green vein, to convey prosperity and long-term momentum.",
  },
  {
    title: "Unified leadership",
    sanskrit: "Three as one",
    body: "Those same three gold and green peaks resolve into a royal crown silhouette, so the founders read as a single authority rather than three separate interests.",
  },
] as const;

export type Vertical = {
  name: string;
  /** "operating" means a live business today; "mandate" means the company is chartered to pursue it. */
  status: "operating" | "mandate";
  summary: string;
  /** The clause of the Memorandum this vertical is drawn from. */
  objectClause: string;
  items: string[];
};

/**
 * The seven sectors named in Object 1 of the Memorandum.
 *
 * Only one is trading today. Mixing the two statuses is deliberate: a holding
 * company that presents its whole charter as live business reads as inflated to
 * the exact audience (partners, lenders, public-sector clients) it needs to convince.
 */
export const verticals: Vertical[] = [
  {
    name: "Consumer technology",
    status: "operating",
    summary:
      "Software products built and operated in-house, beginning with Hikkari, our mobile repair marketplace.",
    objectClause: "Object 2",
    items: ["Mobile platform engineering", "Web infrastructure", "IT-enabled services", "Platform licensing"],
  },
  {
    name: "Digital commerce",
    status: "operating",
    summary:
      "Hyper-local marketplaces and e-commerce surfaces that connect demand to verified supply close to the customer.",
    objectClause: "Object 2",
    items: ["Hyper-local marketplaces", "Marketplace payments and KYC flows", "Vendor onboarding", "Commerce operations"],
  },
  {
    name: "Engineering and hydro-tech",
    status: "mandate",
    summary:
      "Consultancy and contracting in geological surveys, groundwater management and hydro-tech engineering.",
    objectClause: "Object 3",
    items: ["Geological surveys", "Groundwater management", "Hydro-tech engineering", "Water resource planning"],
  },
  {
    name: "Environmental solutions",
    status: "mandate",
    summary:
      "Environmental assessment and infrastructure consulting for government, municipal and commercial clients.",
    objectClause: "Object 3",
    items: ["Environmental assessments", "Infrastructure consulting", "Municipal advisory", "Compliance reporting"],
  },
  {
    name: "Hospitality and events",
    status: "mandate",
    summary:
      "Owned, managed and franchised food and event infrastructure, from cloud kitchens to banquet and marriage halls.",
    objectClause: "Object 4",
    items: ["Cloud kitchens", "Restaurants", "Catering units", "Marriage halls and banquets", "Event venues"],
  },
  {
    name: "Real estate",
    status: "mandate",
    summary: "Acquisition, leasing and management of commercial and leisure properties held across the group.",
    objectClause: "Objects 1 and 4",
    items: ["Commercial leasing", "Leisure properties", "Property management", "Group-occupied sites"],
  },
  {
    name: "Professional services",
    status: "mandate",
    summary:
      "Management, administrative and strategic oversight delivered to group entities and to external clients.",
    objectClause: "Object 1",
    items: ["Group management", "Administrative oversight", "Strategic advisory", "Shared services"],
  },
];

/**
 * Businesses actually trading today.
 *
 * Deliberately separate from the sector list: Hikkari is a single business that
 * operates in two of the chartered sectors, so counting sectors as businesses
 * would overstate the group by a factor of two.
 */
export const operatingBusinesses = ["Hikkari"] as const;

/** Hikkari — the group's operating business. */
export const hikkari = {
  name: "Hikkari",
  category: "Mobile repair marketplace",
  market: "India",
  promise: "Repair quotes from verified local shops, priced against each other, not against you.",
  problem:
    "A broken phone produces two questions nobody answers honestly: what is actually wrong, and what it should cost. Customers work with price opacity and unverifiable local shops. Shops work with walk-in traffic and open price wars.",
  mechanic: [
    {
      step: "Diagnose",
      body: "Symptoms arrive as free text, a guided decision tree, or a photo. All three signals fuse into one standardised repair category.",
    },
    {
      step: "Match",
      body: "Nearby verified vendors are matched by repair category and distance, using spatial indexing rather than a city-wide blast.",
    },
    {
      step: "Bid blind",
      body: "Vendors bid from WhatsApp. They never see each other's prices, so the auction cannot collapse into collusion.",
    },
    {
      step: "Choose",
      body: "Quotes stream in live with part tier, warranty days and turnaround. The customer picks on evidence.",
    },
  ],
  features: [
    {
      title: "Multi-path issue diagnosis",
      body: "Describe the fault in Hinglish, walk a guided decision tree, or upload a photo. A fusion engine combines all three signals into one standardised repair category.",
    },
    {
      title: "Hinglish-native search",
      body: "Local embeddings plus vector and trigram matching resolve phrases like 'screen blank hogaya' to the exact repair category, without translating the customer first.",
    },
    {
      title: "Vision assessment, privacy first",
      body: "Blur detection, local OCR and face redaction run before anything reaches a cloud model, so a customer's screen contents and contacts are not uploaded to answer a repair question.",
    },
    {
      title: "Verified vendor network",
      body: "OTP plus full KYC: GSTIN, bank penny-drop, UPI and fuzzy name matching, with spatial indexing for location-based matching.",
    },
    {
      title: "Blind live bidding",
      body: "Vendors submit counter-bids by WhatsApp text command. Customers watch quotes arrive in real time. No vendor ever sees a competing price.",
    },
    {
      title: "No app install for vendors",
      body: "The whole vendor side runs on WhatsApp. The lowest-friction channel is the one shops already use all day.",
    },
  ],
  audiences: [
    {
      name: "For phone owners",
      body: "You get a standardised diagnosis and competing quotes with warranty terms attached, instead of one shop's word for what went wrong.",
      points: ["Free diagnosis", "Multiple independent quotes", "Warranty days shown per quote", "No vendor sees a rival price"],
    },
    {
      name: "For repair shops",
      body: "You get verified leads in your own locality and set your own margin, without being dragged into a public price war.",
      points: ["Verified, KYC-checked leads", "Bid from WhatsApp, no new software", "You price your own margin", "Blind bidding protects your rates"],
    },
  ],
  stack: [
    { group: "Backend", items: ["Spring Boot 4", "Java 21", "Gradle"] },
    { group: "Data", items: ["PostgreSQL 16", "PostGIS (spatial)", "pgvector (semantic)", "Redis (cache, sessions, pub/sub)"] },
    { group: "Identity", items: ["JWT access + refresh with rotation", "OTP via MSG91", "Sandbox.co.in KYC"] },
    { group: "Real-time", items: ["Server-Sent Events", "WebSocket (STOMP)", "Replay on subscribe"] },
    { group: "Intelligence", items: ["Local ONNX embeddings", "all-MiniLM-L6-v2", "Groq / Gemini vision"] },
    { group: "Integrations", items: ["WhatsApp Cloud API", "HMAC-verified inbound webhooks"] },
  ],
} as const;

/**
 * Sample bid stream for the live demo on /hikkari.
 * Figures are illustrative and labelled as such in the interface.
 */
export const sampleBids = [
  { vendor: "Vendor A", tier: "ORIGINAL", price: 4850, warranty: 180, turnaround: "3 days", distance: "1.2 km" },
  { vendor: "Vendor B", tier: "OEM", price: 3200, warranty: 90, turnaround: "1 day", distance: "2.4 km" },
  { vendor: "Vendor C", tier: "COMPATIBLE", price: 1850, warranty: 30, turnaround: "Same day", distance: "0.8 km" },
  { vendor: "Vendor D", tier: "OEM", price: 2750, warranty: 120, turnaround: "2 days", distance: "3.1 km" },
  { vendor: "Vendor E", tier: "ORIGINAL", price: 4400, warranty: 180, turnaround: "4 days", distance: "1.9 km" },
] as const;
