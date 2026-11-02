export const MAX_BAYS = 8;
export const MAX_UNITS = 1;
export const STORAGE_MIN = 2;
export const STORAGE_MAX = 200;

export const RAID_LEVELS = ['RAID0', 'RAID1', 'RAID5', 'RAID6', 'RAID10'];

export const RAID_INFO = {
  RAID0: { title: 'RAID 0', sub: 'Striping · no redundancy', min: 2, step: 1, tolerance: 0, blurb: 'Striped across every drive for full capacity and speed. No protection: one failed drive loses the whole array.' },
  RAID1: { title: 'RAID 1', sub: 'Mirrored · 50% usable', min: 2, step: 1, tolerance: 1, blurb: 'Two mirrored drives. The simplest protection; usable space is one drive.' },
  RAID5: { title: 'RAID 5', sub: 'Parity · survives 1 failure', min: 3, step: 1, tolerance: 1, blurb: 'Survives one drive failure. One drive’s worth of space goes to parity.' },
  RAID6: { title: 'RAID 6', sub: 'Dual parity · survives 2', min: 4, step: 1, tolerance: 2, blurb: 'Survives two drive failures. Two drives’ worth of space goes to parity.' },
  RAID10: { title: 'RAID 10', sub: 'Mirror + stripe · fast rebuild', min: 4, step: 2, tolerance: 1, blurb: 'Mirrored pairs, striped. Fast rebuilds and good write speed; half the raw space is usable.' },
};

export const surveillanceLines = (P) => new Set((P.driveLines ?? []).filter((l) => l.driveClass === 'surveillance').map((l) => l.name));

export function forUse(P, use) {
  const skip = surveillanceLines(P);
  if (use === 'surveillance' || !skip.size) return P;
  const hddPricing = Object.fromEntries(
    Object.entries(P.hddPricing)
      .map(([cap, lines]) => [cap, Object.fromEntries(Object.entries(lines).filter(([l]) => !skip.has(l)))])
      .filter(([, lines]) => Object.keys(lines).length),
  );
  return { ...P, hddPricing, capacities: Object.keys(hddPricing).map(Number).sort((a, b) => a - b) };
}

export function usableForN(raid, n, c) {
  switch (raid) {
    case 'RAID0': return n * c;
    case 'RAID1': return c;
    case 'RAID5': return (n - 1) * c;
    case 'RAID6': return (n - 2) * c;
    case 'RAID10': return (n / 2) * c;
    default: return 0;
  }
}

export function driveCounts(raid, bays) {
  const { min, step } = RAID_INFO[raid];
  if (bays < min) return [];
  if (raid === 'RAID1') return [2];
  const out = [];
  for (let n = min; n <= bays; n += step) out.push(n);
  return out;
}

export function computeDrives(raid, driveTB, targetTB, maxBays) {
  for (const n of driveCounts(raid, maxBays)) {
    const usable = usableForN(raid, n, driveTB);
    if (usable >= targetTB) return { drivesPerUnit: n, units: 1, totalUsable: usable };
  }
  return null;
}

export function modelMatches(m, { raid, brand = 'any', bays = null, expandableOnly = false }) {
  return (
    m.raid.includes(raid) &&
    m.bays >= RAID_INFO[raid].min &&
    (brand === 'any' || m.brand === brand) &&
    (bays == null || m.bays === bays) &&
    (!expandableOnly || m.expandable)
  );
}

export function capsFor(model, capacities) {
  return capacities.filter((c) => !model.maxDriveTb || c <= model.maxDriveTb);
}

function makeBuild(model, raid, cap, line, drive, drivesPerUnit, totalUsable) {
  return {
    model,
    raid,
    driveCap: cap,
    driveLine: line,
    drive,
    drivesPerUnit,
    units: 1,
    totalUsable,
    spareBays: model.bays - drivesPerUnit,
    totalQuote: model.quote + drive.quote * drivesPerUnit,
  };
}

const byPriceThenFit = (a, b) => a.totalQuote - b.totalQuote || a.totalUsable - b.totalUsable;

export function suggestBuilds({ targetTB, raid, models, hddPricing, capacities, brand, bays, expandableOnly }) {
  const out = [];
  for (const model of models) {
    if (!modelMatches(model, { raid, brand, bays, expandableOnly })) continue;
    for (const cap of capsFor(model, capacities)) {
      const calc = computeDrives(raid, cap, targetTB, model.bays);
      if (!calc) continue;
      for (const [line, drive] of Object.entries(hddPricing[cap] ?? {})) {
        out.push(makeBuild(model, raid, cap, line, drive, calc.drivesPerUnit, calc.totalUsable));
      }
    }
  }
  return out.sort(byPriceThenFit);
}

export function bestBuildPerModel(builds) {
  const seen = new Set();
  return builds.filter((b) => (seen.has(b.model.id) ? false : (seen.add(b.model.id), true)));
}

export function buildableSizes({ raid, models, capacities, hddPricing, brand, bays, expandableOnly }) {
  const sizes = new Set();
  for (const model of models) {
    if (!modelMatches(model, { raid, brand, bays, expandableOnly })) continue;
    for (const cap of capsFor(model, capacities)) {
      if (!hddPricing[cap] || !Object.keys(hddPricing[cap]).length) continue;
      for (const n of driveCounts(raid, model.bays)) {
        const total = usableForN(raid, n, cap);
        if (total >= STORAGE_MIN && total <= STORAGE_MAX && Number.isInteger(total)) sizes.add(total);
      }
    }
  }
  return [...sizes].sort((a, b) => a - b);
}

export function nearestBuildable(target, sizes) {
  let best = null;
  for (const s of sizes) {
    if (best == null) { best = s; continue; }
    const d = Math.abs(s - target);
    const bd = Math.abs(best - target);
    if (d < bd || (d === bd && s > best)) best = s;
  }
  return best;
}

export function suggestBuildsForBudget({ budget, raid, extraCost = () => 0, models, hddPricing, capacities, brand, bays, expandableOnly }) {
  const out = [];
  for (const model of models) {
    if (!modelMatches(model, { raid, brand, bays, expandableOnly })) continue;
    for (const cap of capsFor(model, capacities)) {
      for (const [line, drive] of Object.entries(hddPricing[cap] ?? {})) {
        for (const n of driveCounts(raid, model.bays)) {
          const hardware = model.quote + drive.quote * n;
          if (hardware + extraCost(hardware, 1) > budget) break;
          out.push(makeBuild(model, raid, cap, line, drive, n, usableForN(raid, n, cap)));
        }
      }
    }
  }
  return out.sort((a, b) => b.totalUsable - a.totalUsable || a.totalQuote - b.totalQuote);
}

export const AUTO_RAID_LEVELS = ['RAID1', 'RAID5', 'RAID6'];

export function advisedRaid(drives) {
  if (drives <= 2) return 'RAID1';
  if (drives <= 5) return 'RAID5';
  return 'RAID6';
}

export const followsRaidAdvice = (b) => advisedRaid(b.drivesPerUnit) === b.raid;

function preferAdvised(builds) {
  const advised = builds.filter(followsRaidAdvice);
  return advised.length ? advised : builds;
}

export function autoBuildableSizes(opts) {
  return [...new Set(AUTO_RAID_LEVELS.flatMap((raid) => buildableSizes({ ...opts, raid })))].sort((a, b) => a - b);
}

export function suggestAutoBuilds(opts) {
  const all = AUTO_RAID_LEVELS.flatMap((raid) => suggestBuilds({ ...opts, raid }));
  return preferAdvised(all).sort(byPriceThenFit);
}

export function suggestBudgetPlan(opts) {
  const all = AUTO_RAID_LEVELS.flatMap((raid) => suggestBuildsForBudget({ ...opts, raid }));
  if (all.length) {
    const builds = preferAdvised(all).sort((a, b) => b.totalUsable - a.totalUsable || a.totalQuote - b.totalQuote);
    return { raid: builds[0].raid, builds, redundant: true };
  }
  const raid0 = suggestBuildsForBudget({ ...opts, raid: 'RAID0' });
  return raid0.length ? { raid: 'RAID0', builds: raid0, redundant: false } : null;
}

export function cheapestOutlay({ raidPool = RAID_LEVELS, extraCost = () => 0, models, hddPricing, capacities, brand, bays, expandableOnly }) {
  let least = null;
  for (const raid of raidPool) {
    for (const model of models) {
      if (!modelMatches(model, { raid, brand, bays, expandableOnly })) continue;
      const n = driveCounts(raid, model.bays)[0];
      if (!n) continue;
      for (const cap of capsFor(model, capacities)) {
        for (const drive of Object.values(hddPricing[cap] ?? {})) {
          const hardware = model.quote + drive.quote * n;
          const total = hardware + extraCost(hardware, 1);
          if (least == null || total < least) least = total;
        }
      }
    }
  }
  return least;
}

export function topSpeed(ports = '') {
  let top = 0;
  for (const m of String(ports).matchAll(/(\d+(?:\.\d+)?)\s*GbE/gi)) top = Math.max(top, Number(m[1]));
  return top;
}

export function labelForSpeed(gbps) {
  if (gbps >= 10) return '10GbE';
  if (gbps >= 2.5) return '2.5GbE';
  if (gbps >= 1) return '1GbE';
  return '—';
}

export function networkFor(model) {
  if (!model) return null;
  const topGb = topSpeed(model.network);
  const speed = labelForSpeed(topGb);
  return { speed, quotable: speed === '—' ? null : speed, topGb, ports: model.network, builtIn: model.network || null, upgrade: model.networkUpgrade || null };
}

export function bestNetworkAmong(builds) {
  let best = null;
  for (const b of builds) {
    const net = networkFor(b.model);
    if (net && (!best || net.topGb > best.topGb)) best = { ...net, model: b.model };
  }
  return best;
}

export const inr = (n) =>
  n == null || !Number.isFinite(n)
    ? '—'
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n));
