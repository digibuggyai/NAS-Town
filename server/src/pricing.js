// Builds the NasPricing payload the configurator engine consumes.
//
// Two builders, deliberately separate:
//   toPublicPricing — copies fields one by one. No line in it reads a minimum,
//                     so a floor price cannot reach a browser even by accident.
//   toSalesPricing  — the same shape plus every floor. Staff routes only.
import * as store from './db/store.js';

export class PricingUnavailable extends Error {}

async function loadActive() {
  const [models, drives, driveLines, upgrades, settings] = await Promise.all([
    store.list('models', { activeOnly: true }),
    store.list('drives', { activeOnly: true }),
    store.list('driveLines'),
    store.list('upgrades', { activeOnly: true }),
    store.getSettings(),
  ]);
  if (!models.length || !drives.length || !settings) throw new PricingUnavailable('The price list is incomplete.');
  return { models, drives, driveLines, upgrades, settings };
}

const publicModel = (m) => ({
  id: m.id,
  model: m.model,
  slug: m.slug,
  brand: m.brand,
  bays: m.bays,
  raid: m.raid ?? [],
  expandable: Boolean(m.expandable),
  network: m.network,
  networkUpgrade: m.networkUpgrade,
  cpu: m.cpu,
  cpuCores: m.cpuCores,
  memory: m.memory,
  memoryMax: m.memoryMax,
  m2Slots: m.m2Slots,
  maxDriveTb: m.maxDriveTb,
  baysWithExpansion: m.baysWithExpansion,
  maxRawTb: m.maxRawTb,
  usbPorts: m.usbPorts,
  dimensions: m.dimensions,
  weightKg: m.weightKg,
  warranty: m.warranty,
  specsUrl: m.specsUrl,
  summary: m.summary,
  bestFor: m.bestFor,
  featured: Boolean(m.featured),
  rentable: Boolean(m.rentable),
  quote: m.quotePrice,
});

const publicLine = (l) => ({
  id: l.id,
  name: l.name,
  brand: l.brand,
  driveClass: l.driveClass,
  madeForBrand: l.madeForBrand,
  series: l.series,
  rpm: l.rpm,
  cache: l.cache,
  interface: l.interface,
  recording: l.recording,
  workloadTbYear: l.workloadTbYear,
  mtbf: l.mtbf,
  warrantyYears: l.warrantyYears,
  bestFor: l.bestFor,
  extras: l.extras,
  specsUrl: l.specsUrl,
});

const publicUpgrade = (u) => ({ sku: u.sku, category: u.category, name: u.name, brand: u.brand, spec: u.spec, quote: u.quotePrice });

function assemble({ models, drives, driveLines, upgrades, settings }, withFloors) {
  const hddPricing = {};
  for (const d of drives) {
    hddPricing[d.capacityTb] ??= {};
    hddPricing[d.capacityTb][d.line] = withFloors ? { quote: d.quotePrice, min: d.minPrice ?? undefined } : { quote: d.quotePrice };
  }
  const capacities = Object.keys(hddPricing).map(Number).sort((a, b) => a - b);
  return {
    models: models.map((m) => (withFloors ? { ...publicModel(m), min: m.minPrice ?? undefined } : publicModel(m))),
    capacities,
    hddPricing,
    driveLines: driveLines.map(publicLine),
    upgrades: upgrades.map((u) => (withFloors ? { ...publicUpgrade(u), min: u.minPrice ?? undefined } : publicUpgrade(u))),
    install: withFloors ? { quote: settings.installQuote, min: settings.installMin ?? undefined } : { quote: settings.installQuote },
    amcRate: withFloors
      ? { quote: settings.amcQuotePercent / 100, min: settings.amcMinPercent != null ? settings.amcMinPercent / 100 : undefined }
      : { quote: settings.amcQuotePercent / 100 },
  };
}

let publicCache = null;

export async function toPublicPricing() {
  if (!publicCache) publicCache = assemble(await loadActive(), false);
  return publicCache;
}

export async function toSalesPricing() {
  return assemble(await loadActive(), true);
}

/** Clear cached pricing after any admin write, so a saved price shows at once. */
export function invalidatePricing() {
  publicCache = null;
}

/* ---------------- product cards for the rest of the site ---------------- */

const speed = (ports = '') => Math.max(0, ...[...String(ports).matchAll(/(\d+(?:\.\d+)?)\s*GbE/gi)].map((m) => Number(m[1])));

function segmentOf(m) {
  if (m.bays >= 8) return 'enterprise';
  if (m.bays <= 2 && m.quote < 50000) return 'home';
  if (m.bays >= 5 || m.quote >= 90000) return 'business';
  return 'creator';
}

function useCasesOf(m) {
  const fast = speed(m.network) >= 2.5 || /10GbE/i.test(m.networkUpgrade ?? '');
  const out = ['backup'];
  if (m.bays <= 2 || m.quote < 50000) out.push('home');
  if (m.bays >= 2) out.push('photos');
  if (fast && (m.bays >= 4 || m.m2Slots)) out.push('videos');
  if (m.bays >= 4) out.push('business', 'surveillance');
  return out;
}

export function toProduct(m) {
  const top = speed(m.network);
  return {
    id: m.id,
    slug: m.slug,
    brand: m.brand.toLowerCase(),
    model: `${m.brand} ${m.model}`,
    shortModel: m.model,
    bays: m.bays,
    cpu: m.cpu,
    memory: m.memoryMax ? `${m.memory} (max ${m.memoryMax})` : m.memory,
    network: m.network,
    networkUpgrade: m.networkUpgrade,
    key_spec: `${m.bays}-bay · ${top >= 10 ? '10GbE' : top >= 2.5 ? '2.5GbE' : '1GbE'}${m.expandable ? ' · expandable' : ''}`,
    segment: segmentOf(m),
    use_cases: useCasesOf(m),
    max_raw_tb: m.maxRawTb ?? (m.maxDriveTb ? m.bays * m.maxDriveTb : null),
    max_drive_tb: m.maxDriveTb,
    raid: m.raid,
    expandable: m.expandable,
    bays_with_expansion: m.baysWithExpansion,
    m2_slots: m.m2Slots,
    warranty: m.warranty,
    price_inr: m.quote,
    featured: m.featured,
    rentable: m.rentable,
    summary: m.summary,
    best_for: m.bestFor,
  };
}
