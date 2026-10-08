/* Configurator answers → configuration. Same engine as the DGB India configurator
 * (docs: nas-configurator-spec.md): one Answers object in, one Derived object out,
 * re-derived on every change. No wizard state; the answers are never mutated —
 * derive() returns the effective values (nearest buildable size, chosen RAID level,
 * the unit actually picked) instead. */

import {
  MAX_UNITS,
  RAID_INFO,
  bestBuildPerModel,
  buildableSizes,
  cheapestOutlay,
  inr,
  labelForSpeed,
  nearestBuildable,
  networkFor,
  suggestBudgetPlan,
  suggestBuilds,
  suggestBuildsForBudget,
  topSpeed,
} from './logic.js';

/** Where every visitor starts: nothing chosen. Once a size or budget is picked, everything
 *  else is suggested (RAID 5, Auto bays, brand, unit and drives) and can then be changed.
 *  Installation and AMC stay unticked until the customer adds them. */
export const INITIAL_ANSWERS = {
  storageMode: 'capacity', // 'capacity' | 'budget'
  targetTB: null, // null = not chosen yet
  budget: null, // null = not chosen yet
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
  includeInstall: false,
  includeAMC: false,
};

export const BUDGET_PRESETS = [100000, 150000, 200000, 300000, 500000];
export const CAPACITY_PRESETS = [10, 20, 50, 100];

/** Narrow by drive size first, then line, each falling back on its own; then settle on a unit.
 *  Filtering on both at once let an impossible size swallow a perfectly good line. */
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
  return { mode, error, pending: false, sizes: [], targetTB: a.targetTB, movedFrom: null, raid, redundant: true, builds: [], options: [], build: null, autoPick: a.autoPick };
}

/** What the customer pays on top of hardware: a budget covers the whole quote. */
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
    if (budget == null) return { ...unbuilt(a, 'budget', null), pending: true }; // waiting for a budget
    if (!(budget > 0)) return unbuilt(a, 'budget', 'Enter a budget to size against.');
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
    return { mode: 'budget', error: null, sizes: [], targetTB: picked.build ? picked.build.totalUsable : a.targetTB, movedFrom: null, raid, redundant, builds, ...picked };
  }

  const sizes = buildableSizes({ raid: a.raid, ...catalogue });
  if (!sizes.length) {
    return { ...unbuilt(a, 'capacity', 'Nothing on our price list can be built with these choices. Widen the brand, bays or RAID level.'), sizes };
  }
  if (a.targetTB == null) return { ...unbuilt(a, 'capacity', null), sizes, pending: true }; // waiting for a size
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
 * The options worth offering, read off the same build pool the recommendation uses, so the
 * pickers can't drift from the catalogue. Grey out what can't be built; never hide it.
 * Bays are judged as if no size were pinned (or there'd be no way back), and only sizes the
 * array actually fills are offered; where nothing fits exactly, the least wasteful ones are.
 * Drive sizes are judged against the whole pool, lines against the chosen size.
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

/** The RAM / network card chosen, or null once it stops existing in the price list. */
export const selectedUpgrade = (P, category, sku) => (sku ? P.upgrades.find((u) => u.sku === sku && u.category === category) ?? null : null);

/**
 * The money for a build. Everything is GST inclusive. Installation is per chassis; AMC is a
 * percentage of hardware only. The floor is computed only when both the unit and the drive
 * carry a minimum (a partial floor misleads); upgrades and installation fall back to their
 * quote when they have none. Floors only exist on the staff payload.
 */
export function priceFor(build, a, P) {
  if (!build) return null;
  const { units, drivesPerUnit, model, drive } = build;
  const ram = selectedUpgrade(P, 'RAM', a.ramSku);
  const nic = selectedUpgrade(P, 'NIC', a.nicSku);

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

  return {
    nas, hdd, ram: ramCost, nic: nicCost, hardware, install, amc, total,
    totalDrives: drivesPerUnit * units,
    perTB: build.totalUsable ? total / build.totalUsable : null,
    floor, ramItem: ram, nicItem: nic,
  };
}

/** What the build can do on the network, and the speed to quote (a network card can raise it). */
export function speedFor(build, nic) {
  const net = networkFor(build?.model);
  const nicTopGb = nic ? topSpeed(`${nic.name} ${nic.spec ?? ''}`) : 0;
  const topGb = Math.max(net?.topGb ?? 0, nicTopGb);
  const label = labelForSpeed(topGb);
  return { net, nicTopGb, topGb, speed: label === '—' ? (net?.quotable ?? null) : label };
}

/* ---------------- estimate & lead ---------------- */

/** Estimate rows for display, PDF and the lead, with the floor beside each when present. */
export function estimateLines(build, price, a, P) {
  if (!build || !price) return [];
  const f = price.floor;
  const u = build.units;
  const rows = [
    { key: 'nas', label: `${build.model.brand} ${build.model.model}`, detail: `${build.model.bays}-bay NAS${build.model.network ? ` · ${build.model.network}` : ''}`, basis: `${u} × ${inr(build.model.quote)}`, qty: u, rate: build.model.quote, quote: price.nas, floor: f?.nas },
    { key: 'hdd', label: `${build.driveCap} TB ${build.driveLine}`, detail: `${build.drivesPerUnit} per unit, configured as ${RAID_INFO[build.raid].title}`, basis: `${build.drivesPerUnit * u} × ${inr(build.drive.quote)}`, qty: build.drivesPerUnit * u, rate: build.drive.quote, quote: price.hdd, floor: f?.hdd },
  ];
  if (price.ramItem) rows.push({ key: 'ram', label: price.ramItem.name, detail: 'RAM upgrade', basis: `${u} × ${inr(price.ramItem.quote)}`, qty: u, rate: price.ramItem.quote, quote: price.ram, floor: f?.ram });
  if (price.nicItem) rows.push({ key: 'nic', label: price.nicItem.name, detail: 'Network card', basis: `${u} × ${inr(price.nicItem.quote)}`, qty: u, rate: price.nicItem.quote, quote: price.nic, floor: f?.nic });
  rows.push({ key: 'hardware', label: 'Hardware', basis: '', quote: price.hardware, floor: f?.hardware, subtotal: true });
  if (a.includeInstall) rows.push({ key: 'install', label: 'Installation & setup', detail: 'Racking, RAID configuration, network setup', basis: `${u} × ${inr(P.install.quote)}`, qty: u, rate: P.install.quote, quote: price.install, floor: f?.install });
  if (a.includeAMC) rows.push({ key: 'amc', label: 'Annual maintenance (AMC)', detail: `${Math.round(P.amcRate.quote * 100)}% of hardware value, first year`, basis: `${Math.round(P.amcRate.quote * 100)}% of hardware`, quote: price.amc, floor: f?.amc });
  rows.push({ key: 'total', label: 'Total', basis: 'GST inclusive', quote: price.total, floor: f?.total, total: true });
  return rows;
}

/** A reference for the estimate and the lead, e.g. NT-NAS-20261008-K3F9. */
export function estimateRef(now = new Date()) {
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `NT-NAS-${stamp}-${now.getTime().toString(36).slice(-4).toUpperCase()}`;
}

/** The configuration as plain text, filed with the lead so sales sees exactly what was configured. */
export function leadSummary(d, build, price, speed, a, P, ref) {
  if (!build || !price) return '';
  const addons = [a.includeInstall ? 'Installation & setup' : null, a.includeAMC ? `AMC (${Math.round(P.amcRate.quote * 100)}%)` : null].filter(Boolean).join(', ');
  return [
    ref ? `NAS configurator request · ${ref}` : null,
    ref ? '' : null,
    `Unit: ${build.model.brand} ${build.model.model} (${build.model.bays}-bay)${build.units > 1 ? ` × ${build.units}` : ''}`,
    `Drives: ${price.totalDrives} × ${build.driveCap} TB ${build.driveLine}`,
    `RAID: ${RAID_INFO[d.raid].title}, ${build.totalUsable} TB usable`,
    `Network: ${speed ?? 'Not specified'}${build.model.networkUpgrade ? ` (upgradable: ${build.model.networkUpgrade})` : ''}`,
    price.ramItem ? `RAM upgrade: ${price.ramItem.name}` : null,
    price.nicItem ? `Network card: ${price.nicItem.name}` : null,
    `Add-ons: ${addons || 'None'}`,
    '',
    d.mode === 'budget' ? `Sized by budget: ${inr(a.budget)}` : `Sized by capacity: ${d.targetTB} TB${d.movedFrom ? ` (asked ${d.movedFrom} TB)` : ''}`,
    `Preferences: brand ${a.brand === 'any' ? 'any' : a.brand} · bays ${a.bays ?? 'auto'} · expansion ${a.expandable ? 'required' : 'not required'}`,
    '',
    `Estimated total (incl. GST): ${inr(price.total)}`,
  ].filter((line) => line !== null).join('\n');
}
