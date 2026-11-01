import { brandName, capacityPages } from '../data/site.js';

export const topGbe = (network = '') =>
  Math.max(0, ...[...String(network).matchAll(/(\d+(?:\.\d+)?)\s*GbE/gi)].map((m) => Number(m[1])));

export function maxProtectedTb(p, largestDrive) {
  const drive = Math.min(p.max_drive_tb || Infinity, largestDrive || p.max_drive_tb || 0);
  if (!drive || !Number.isFinite(drive)) return 0;
  return (p.bays >= 3 ? p.bays - 1 : 1) * drive;
}

const USE = {
  home: { label: 'Home', test: (p) => p.use_cases?.includes('home') },
  creators: { label: 'Creators', test: (p) => p.use_cases?.includes('videos') },
  business: { label: 'Business', test: (p) => p.use_cases?.includes('business') },
  surveillance: { label: 'Surveillance', test: (p) => p.use_cases?.includes('surveillance') },
  enterprise: { label: 'Enterprise', test: (p) => p.segment === 'enterprise' },
};

const BAYS = {
  2: { label: '2-Bay', test: (p) => p.bays === 2 },
  4: { label: '4-Bay', test: (p) => p.bays === 4 },
  5: { label: '5-Bay', test: (p) => p.bays === 5 },
  '6-8': { label: '6/8-Bay', test: (p) => p.bays >= 6 },
  rackmount: { label: 'Rackmount', test: (p) => p.form_factor === 'rackmount' },
};

const NET = {
  1: { label: '1GbE', test: (p) => topGbe(p.network) === 1 },
  2.5: { label: '2.5GbE+', test: (p) => topGbe(p.network) >= 2.5 },
  10: { label: '10GbE', test: (p) => topGbe(p.network) >= 10 },
};

const PRICE = {
  u50: { label: 'Under ₹50,000', test: (p) => p.price_inr != null && p.price_inr < 50000 },
  '50-100': { label: '₹50,000 – ₹1,00,000', test: (p) => p.price_inr >= 50000 && p.price_inr <= 100000 },
  '100p': { label: 'Over ₹1,00,000', test: (p) => p.price_inr > 100000 },
};

export const SORTS = [
  ['', 'Recommended'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['bays', 'Drive bays: fewest first'],
];

export function filterGroups(products) {
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  return [
    { key: 'bays', title: 'Drive bays', options: Object.entries(BAYS).map(([v, o]) => [v, o.label]) },
    { key: 'brand', title: 'Brand', options: brands.map((b) => [b, brandName(b)]) },
    { key: 'cap', title: 'Storage you need', options: capacityPages.map(({ tb }) => [String(tb), `${tb} TB`]) },
    { key: 'use', title: 'Use case', options: Object.entries(USE).map(([v, o]) => [v, o.label]) },
    { key: 'net', title: 'Network', options: Object.entries(NET).map(([v, o]) => [v, o.label]) },
    { key: 'price', title: 'Price (diskless)', options: Object.entries(PRICE).map(([v, o]) => [v, o.label]) },
  ];
}

export function readFilters(params) {
  const f = {};
  for (const key of ['bays', 'brand', 'cap', 'use', 'net', 'price', 'sort']) {
    const v = params.get(key);
    if (v) f[key] = v;
  }
  if (params.get('type') === 'rackmount') f.bays = 'rackmount';
  return f;
}

export function applyFilters(products, f, largestDrive) {
  const tests = [
    f.bays && BAYS[f.bays]?.test,
    f.brand && ((p) => p.brand === f.brand),
    f.cap && ((p) => maxProtectedTb(p, largestDrive) >= Number(f.cap)),
    f.use && USE[f.use]?.test,
    f.net && NET[f.net]?.test,
    f.price && PRICE[f.price]?.test,
  ].filter(Boolean);
  const list = products.filter((p) => tests.every((t) => t(p)));
  const price = (p) => p.price_inr ?? Infinity;
  if (f.sort === 'price-asc') list.sort((a, b) => price(a) - price(b));
  if (f.sort === 'price-desc') list.sort((a, b) => price(b) - price(a));
  if (f.sort === 'bays') list.sort((a, b) => a.bays - b.bays || price(a) - price(b));
  return list;
}
