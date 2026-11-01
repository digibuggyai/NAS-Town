const SOLUTIONS = [
  ['photographers', 'Photographers', 'photos'],
  ['videographers', 'Videographers', 'videos'],
  ['creators', 'Creators', 'videos'],
  ['business', 'Business', 'business'],
  ['home', 'Home', 'home'],
  ['surveillance', 'Surveillance', 'surveillance'],
  ['enterprise', 'Enterprise', 'business'],
];

export const PRODUCT_PAGES = [
  { key: 'products', label: 'NAS Products', path: '/products' },
  { key: 'brand', label: 'Brand page', path: '/brands' },
  ...SOLUTIONS.map(([slug, name]) => ({ key: `solution:${slug}`, label: `For ${name}`, path: `/solutions/${slug}` })),
];

export const PAGE_KEYS = new Set(PRODUCT_PAGES.map((p) => p.key));

export const NEW_MODEL_PAGES = ['products', 'brand'];

const speed = (ports = '') => Math.max(0, ...[...String(ports).matchAll(/(\d+(?:\.\d+)?)\s*GbE/gi)].map((m) => Number(m[1])));

export function useCasesOf(m) {
  const quote = m.quote ?? m.quotePrice;
  const fast = speed(m.network) >= 2.5 || /10GbE/i.test(m.networkUpgrade ?? '');
  const out = ['backup'];
  if (m.bays <= 2 || quote < 50000) out.push('home');
  if (m.bays >= 2) out.push('photos');
  if (fast && (m.bays >= 4 || m.m2Slots)) out.push('videos');
  if (m.bays >= 4) out.push('business', 'surveillance');
  return out;
}

export function defaultPlacements(models) {
  const out = new Map(models.map((m) => [m.id, [...NEW_MODEL_PAGES]]));
  for (const [slug, , useCase] of SOLUTIONS) {
    models.filter((m) => m.active !== false && useCasesOf(m).includes(useCase)).slice(0, 4)
      .forEach((m) => out.get(m.id).push(`solution:${slug}`));
  }
  return out;
}
