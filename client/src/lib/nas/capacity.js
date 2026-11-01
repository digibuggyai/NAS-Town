import { bestBuildPerModel, buildableSizes, suggestBuilds } from './logic.js';

export const CAPACITY_RAIDS = ['RAID1', 'RAID5', 'RAID6', 'RAID10'];

const catalogueFor = (P, raid) => ({ raid, models: P.models, hddPricing: P.hddPricing, capacities: P.capacities, brand: 'any', bays: null, expandableOnly: false });

export function capacityOptions(P, tb) {
  const out = [];
  for (const raid of CAPACITY_RAIDS) {
    const catalogue = catalogueFor(P, raid);
    const target = buildableSizes(catalogue).find((s) => s >= tb);
    if (!target) continue;
    const builds = suggestBuilds({ targetTB: target, ...catalogue });
    if (builds.length) out.push({ raid, target, builds });
  }
  return out;
}

export function recommended(options, tb) {
  const { RAID1: r1, RAID5: r5 } = Object.fromEntries(options.map((o) => [o.raid, o]));
  const lead = r5 && (!r1 || tb > 10 || r5.builds[0].totalQuote <= r1.builds[0].totalQuote) ? r5 : r1;
  return lead ? { lead, picks: bestBuildPerModel(lead.builds).slice(0, 3) } : { lead: null, picks: [] };
}

export function cheapestFor(P, tb) {
  const prices = capacityOptions(P, tb).map((o) => o.builds[0].totalQuote);
  return prices.length ? Math.min(...prices) : null;
}

export function whatFits(tb) {
  const round = (n) => (n >= 10000 ? Math.round(n / 1000) * 1000 : n >= 1000 ? Math.round(n / 100) * 100 : Math.round(n / 10) * 10);
  return [
    [round((tb * 1e6) / 30), 'RAW photos', 'at about 30 MB each'],
    [round((tb * 1000) / 45), 'hours of 4K video', 'H.265, about 45 GB an hour'],
    [round(tb * 2), 'full laptop backups', 'at 500 GB each'],
  ];
}
