/* Configurator answers → configuration. One Answers object in, one Derived
 * object out; the answers are never mutated, so state stays what the visitor
 * actually chose. Network speed is never stored: it is always read off the
 * unit currently chosen. */

import {
  MAX_UNITS,
  RAID_INFO,
  bestBuildPerModel,
  buildableSizes,
  cheapestOutlay,
  inr,
  nearestBuildable,
  networkFor,
  suggestBudgetPlan,
  suggestBuilds,
  suggestBuildsForBudget,
} from './logic.js';

export const INITIAL_ANSWERS = {
  storageMode: 'capacity', // 'capacity' | 'budget'
  targetTB: 20,
  budget: 200000,
  brand: 'any',
  bays: null,
  raid: 'RAID5',
  raidAuto: true, // budget mode only: let the tool choose the level
  expandable: false,
  modelId: null,
  autoPick: true, // false once a unit is chosen by hand
  driveCap: null, // null = Auto
  driveLine: null, // null = Auto
  ramSku: null,
  nicSku: null,
  includeInstall: true,
  includeAMC: false,
};

export const BUDGET_PRESETS = [100000, 150000, 200000, 300000, 500000];
export const CAPACITY_PRESETS = [10, 20, 50, 100];

/** Narrow by drive size first, then line, each falling back on its own; then settle on a unit. */
export function pickBuild(a, builds) {
  const byCap = a.driveCap == null ? builds : builds.filter((b) => b.driveCap === a.driveCap);
  const capPool = byCap.length ? byCap : builds;
  const byLine = a.driveLine == null ? capPool : capPool.filter((b) => b.driveLine === a.driveLine);
  const pool = byLine.length ? byLine : capPool;
  const options = bestBuildPerModel(pool);
  const pinned = a.autoPick ? null : (pool.find((b) => b.model.id === a.modelId) ?? null);
  return { options, build: pinned ?? options[0] ?? null, autoPick: !pinned };
}

function unbuilt(a, mode, error, raid = a.raid) {
  return { mode, error, sizes: [], targetTB: a.targetTB, movedFrom: null, raid, redundant: true, builds: [], options: [], build: null, autoPick: a.autoPick };
}

export function extraCostFor(a, P) {
  return (hardware, units) =>
    (a.includeInstall ? P.install.quote * units : 0) + (a.includeAMC ? hardware * P.amcRate.quote : 0);
}

export function derive(a, P) {
  const catalogue = {
    models: P.models,
    hddPricing: P.hddPricing,
    capacities: P.capacities,
    brand: a.brand,
    bays: a.bays,
    expandableOnly: a.expandable,
    maxUnits: MAX_UNITS,
  };

  if (a.storageMode === 'budget') {
    const budget = a.budget;
    if (budget == null || !(budget > 0)) return unbuilt(a, 'budget', 'Enter a budget to size against.');

    // A budget covers the whole quote, so anything ticked on top of the
    // hardware comes out of it rather than surprising the customer later.
    const extraCost = extraCostFor(a, P);

    let raid = a.raid;
    let builds;
    let redundant = true;
    if (a.raidAuto) {
      const plan = suggestBudgetPlan({ budget, extraCost, ...catalogue });
      if (!plan) {
        const least = cheapestOutlay({ extraCost, ...catalogue });
        return unbuilt(
          a,
          'budget',
          least == null
            ? 'Nothing on our price list can be built with these choices. Widen the brand, bays or RAID level.'
            : `${inr(budget)} doesn't cover a complete configuration. The least we can build with these choices is ${inr(least)}.`,
        );
      }
      raid = plan.raid;
      builds = plan.builds;
      redundant = plan.redundant;
    } else {
      builds = suggestBuildsForBudget({ budget, raid, extraCost, ...catalogue });
      if (!builds.length) {
        const least = cheapestOutlay({ raidPool: [raid], extraCost, ...catalogue });
        return unbuilt(
          a,
          'budget',
          least == null
            ? `No ${RAID_INFO[raid].title} build is possible with these choices. Try another level.`
            : `No ${RAID_INFO[raid].title} build fits ${inr(budget)}. The cheapest is ${inr(least)}. Let us choose the level, or raise the budget.`,
        );
      }
    }

    const picked = pickBuild(a, builds);
    return {
      mode: 'budget',
      error: null,
      sizes: [],
      targetTB: picked.build ? picked.build.totalUsable : a.targetTB,
      movedFrom: null,
      raid,
      redundant,
      builds,
      ...picked,
    };
  }

  const sizes = buildableSizes({ raid: a.raid, ...catalogue });
  if (!sizes.length) {
    return { ...unbuilt(a, 'capacity', 'Nothing on our price list can be built with these choices. Widen the brand, bays or RAID level.'), sizes };
  }

  const targetTB = sizes.includes(a.targetTB) ? a.targetTB : (nearestBuildable(a.targetTB, sizes) ?? a.targetTB);
  const builds = suggestBuilds({ targetTB, raid: a.raid, ...catalogue });
  return {
    mode: 'capacity',
    error: null,
    sizes,
    targetTB,
    movedFrom: targetTB !== a.targetTB ? a.targetTB : null,
    raid: a.raid,
    redundant: a.raid !== 'RAID0',
    builds,
    ...pickBuild(a, builds),
  };
}

/* ---------------- which options can actually be built ---------------- */

/**
 * Options worth offering, read off the same build pool as the recommendation.
 * Bays are computed as if no bay size were pinned, and only chassis sizes the
 * array actually fills are offered (or, where nothing fits exactly, the ones
 * wasting the fewest bays). Drive sizes are judged against the whole pool,
 * drive lines against the chosen size.
 */
export function feasibleOptions(a, P, d) {
  const bayPool = a.bays == null ? d.builds : derive({ ...a, bays: null }, P).builds;
  const byCap = a.driveCap == null ? d.builds : d.builds.filter((b) => b.driveCap === a.driveCap);

  const spare = new Map();
  for (const b of bayPool) {
    const empty = b.model.bays - b.drivesPerUnit;
    const best = spare.get(b.model.bays);
    if (best == null || empty < best) spare.set(b.model.bays, empty);
  }
  const tightest = spare.size ? Math.min(...spare.values()) : 0;

  return {
    bays: new Set([...spare].filter(([, empty]) => empty === tightest).map(([tier]) => tier)),
    caps: new Set(d.builds.map((b) => b.driveCap)),
    lines: new Set((byCap.length ? byCap : d.builds).map((b) => b.driveLine)),
    bayPool,
  };
}

/* ---------------- pricing ---------------- */

const findUpgrade = (P, sku, category) => (sku ? P.upgrades.find((u) => u.sku === sku && u.category === category) ?? null : null);

/**
 * The money for a build. Everything is GST inclusive. Installation is per
 * chassis; AMC is a percentage of hardware only. The floor is computed only
 * when both the unit and the drive carry a minimum (a partial floor misleads);
 * upgrades and installation fall back to their quote when they have none.
 */
export function priceFor(build, a, P) {
  if (!build) return null;
  const { units, drivesPerUnit, model, drive } = build;
  const ram = findUpgrade(P, a.ramSku, 'RAM');
  const nic = findUpgrade(P, a.nicSku, 'NIC');

  const nas = model.quote * units;
  const hdd = drive.quote * drivesPerUnit * units;
  const ramCost = (ram?.quote ?? 0) * units;
  const nicCost = (nic?.quote ?? 0) * units;
  const hardware = nas + hdd + ramCost + nicCost;
  const install = a.includeInstall ? P.install.quote * units : 0;
  const amc = a.includeAMC ? hardware * P.amcRate.quote : 0;
  const total = hardware + install + amc;

  let floor = null;
  if (model.min != null && drive.min != null) {
    const fNas = model.min * units;
    const fHdd = drive.min * drivesPerUnit * units;
    const fRam = (ram ? (ram.min ?? ram.quote) : 0) * units;
    const fNic = (nic ? (nic.min ?? nic.quote) : 0) * units;
    const fHardware = fNas + fHdd + fRam + fNic;
    const fInstall = a.includeInstall ? (P.install.min ?? P.install.quote) * units : 0;
    const fAmc = a.includeAMC ? fHardware * (P.amcRate.min ?? P.amcRate.quote) : 0;
    floor = { nas: fNas, hdd: fHdd, ram: fRam, nic: fNic, hardware: fHardware, install: fInstall, amc: fAmc, total: fHardware + fInstall + fAmc };
  }

  return { nas, hdd, ram: ramCost, nic: nicCost, hardware, install, amc, total, perTB: build.totalUsable ? total / build.totalUsable : null, floor, ramItem: ram, nicItem: nic };
}

/** Estimate rows for display and the lead, with the floor beside each when present. */
export function estimateLines(build, price, a, P) {
  if (!build || !price) return [];
  const f = price.floor;
  const u = build.units;
  const rows = [
    { key: 'nas', label: 'NAS unit', basis: `${u} × ${inr(build.model.quote)}`, quote: price.nas, floor: f?.nas },
    { key: 'hdd', label: 'Hard drives', basis: `${build.drivesPerUnit * u} × ${inr(build.drive.quote)}`, quote: price.hdd, floor: f?.hdd },
  ];
  if (price.ramItem) rows.push({ key: 'ram', label: price.ramItem.name, basis: `${u} × ${inr(price.ramItem.quote)}`, quote: price.ram, floor: f?.ram });
  if (price.nicItem) rows.push({ key: 'nic', label: price.nicItem.name, basis: `${u} × ${inr(price.nicItem.quote)}`, quote: price.nic, floor: f?.nic });
  rows.push({ key: 'hardware', label: 'Hardware', basis: '', quote: price.hardware, floor: f?.hardware, subtotal: true });
  if (a.includeInstall) rows.push({ key: 'install', label: 'Installation & setup', basis: `${u} × ${inr(P.install.quote)}`, quote: price.install, floor: f?.install });
  if (a.includeAMC) rows.push({ key: 'amc', label: 'AMC (1 year)', basis: `${Math.round(P.amcRate.quote * 100)}% of hardware`, quote: price.amc, floor: f?.amc });
  rows.push({ key: 'total', label: 'Total', basis: 'GST inclusive', quote: price.total, floor: f?.total, total: true });
  return rows;
}

/** Plain-text summary of the configuration, filed with the lead. */
export function leadSummary(build, price, a, d) {
  if (!build) return '';
  const net = networkFor(build.model);
  const lines = [
    `${build.model.brand} ${build.model.model} × ${build.units} (${build.model.bays}-bay)`,
    `${build.drivesPerUnit * build.units} × ${build.driveCap} TB ${build.driveLine} · ${RAID_INFO[build.raid].title} · ${build.totalUsable} TB usable`,
    `Network: ${net.ports}${net.upgrade ? ` (upgradable: ${net.upgrade})` : ''}`,
  ];
  if (price.ramItem) lines.push(`RAM: ${price.ramItem.name}`);
  if (price.nicItem) lines.push(`Network card: ${price.nicItem.name}`);
  lines.push(`Installation: ${a.includeInstall ? 'yes' : 'no'} · AMC: ${a.includeAMC ? 'yes' : 'no'}`);
  lines.push(`Estimate: ${inr(price.total)} (hardware ${inr(price.hardware)}), GST inclusive`);
  lines.push(d.mode === 'budget' ? `Sized by budget: ${inr(a.budget)}` : `Sized by capacity: ${d.targetTB} TB${d.movedFrom ? ` (asked ${d.movedFrom} TB)` : ''}`);
  return lines.join('\n');
}
