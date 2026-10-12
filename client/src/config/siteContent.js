// Facts about NASTOWN that only you can supply: numbers, customers, group companies.
//
// Rule: real data only. Every empty value below is a TODO, and the part of the site that
// uses it stays hidden until it's filled in. Nothing here is ever guessed or made up.

/* ---------------- 7. Numbers strip (homepage) ----------------
 * `value` is what's shown, exactly as written: '1,200+', '5,000 TB', '15'. Digits count up
 * when the strip scrolls into view; any prefix/suffix (+, TB, hrs) stays as typed.
 * A counter with an empty value is hidden; the whole strip is hidden while all are empty. */
export const stats = [
  { value: '', label: 'NAS units installed' }, // TODO: from your sales records
  { value: '', label: 'TB of data managed' }, // TODO
  { value: '', label: 'Businesses & creators served' }, // TODO
  { value: '', label: 'Years in IT infrastructure' }, // TODO: e.g. years since Digibuggy / DGB India started
];

/* ---------------- 10. "Trusted by" customer logo wall ----------------
 * Only customers who have agreed to be listed. `logo` is a file you add under
 * client/public/images/customers/ (SVG or PNG, transparent background).
 * Example: { name: 'Acme Studios', logo: '/images/customers/acme.svg', url: 'https://acme.example' }
 * The section is hidden while this list is empty. */
export const customers = []; // TODO

/* ---------------- 11. House of DigiBuggy ----------------
 * The group's brands, shown on the homepage and linked from the footer and About page.
 * A brand with no `url` or `description` is left out until it's filled in. */
export const parentCompany = {
  name: 'DigiBuggy',
  alsoKnownAs: 'DGB India',
  site: 'https://digibuggy.com/',
  // DGB India's own site, used in the footer line "A DigiBuggy (DGB India) company".
  dgbSite: 'https://dgbindia.com/',
};

export const groupBrands = [
  {
    key: 'nastown',
    name: 'NASTOWN',
    description: 'NAS storage: choosing, configuring, installing and supporting it.',
    url: '/',
    logo: '/nastown-logo-sm.png',
    current: true, // "You are here"
  },
  {
    key: 'dgb',
    name: 'DGB India',
    description: 'Enterprise IT infrastructure.',
    url: 'https://dgbindia.com/',
  },
  {
    key: 'avs',
    name: 'AVS',
    description: '', // TODO: confirm AVS's full name and a one-line description
    url: '', // TODO: AVS website
  },
  {
    key: 'digibuggy',
    name: 'DigiBuggy',
    description: 'The parent company: custom PC and storage builders in Nehru Place, New Delhi.',
    url: 'https://digibuggy.com/',
    logo: '/digibuggy-logo.svg',
    logoOnDark: true, // the DigiBuggy wordmark is white
  },
];

/* ---------------- 12. Experience Zone ----------------
 * What used to be called the showroom: the place to see NAS units running live. */
export const experienceZone = {
  name: 'Experience Zone',
  invite: 'See NAS running live. Visit our Experience Zone at Nehru Place.',
  // WhatsApp message pre-filled by the "Book a visit" button.
  bookVisitText: "Hi NASTOWN, I'd like to book a visit to your Experience Zone at Nehru Place.",
};

/* ---------------- Final call to action ---------------- */
export const quoteText = "Hi NASTOWN, I'd like a free quote for a NAS.";
