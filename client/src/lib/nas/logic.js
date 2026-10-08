/* NAS sizing maths and build search. Pure functions: no DOM, no I/O, no React.
 *
 * A "build" is a complete proposal:
 *   { model, raid, driveCap, driveLine, drive: { quote, min? }, drivesPerUnit,
 *     units, totalUsable, spareBays, totalQuote }
 * where totalQuote is hardware only (units + drives), GST inclusive.
 *
 * Nothing here reads a floor price; floors travel inside `drive` and `model`
 * only when the staff payload supplied them, and only priceFor() uses them. */

export const MAX_BAYS = 8;
export const MAX_UNITS = 4;
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

/** Usable TB from n drives of c TB at a RAID level. */
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

/** Drive counts a chassis of `bays` can run at this level. RAID 1 is always one pair. */
export function driveCounts(raid, bays) {
  const { min, step } = RAID_INFO[raid];
  if (bays < min) return [];
  if (raid === 'RAID1') return [2];
  const out = [];
  for (let n = min; n <= bays; n += step) out.push(n);
  return out;
}

/** Drives and chassis needed to reach a target. Returns units: Infinity when the chassis can't host the array. */
export function computeDrives(raid, driveTB, targetTB, maxBays) {
  const { min, step } = RAID_INFO[raid];
  if (maxBays < min) return { drivesPerUnit: 0, units: Infinity, totalUsable: 0 };
  if (raid === 'RAID1') {
    const units = Math.max(1, Math.ceil(targetTB / driveTB));
    return { drivesPerUnit: 2, units, totalUsable: units * driveTB };
  }
  for (let n = min; n <= maxBays; n += step) {
    const usable = usableForN(raid, n, driveTB);
    if (usable >= targetTB) return { drivesPerUnit: n, units: 1, totalUsable: usable };
  }
  // Doesn't fit in one box: fill it, then gang more boxes.
  const fullest = step === 2 ? maxBays - (maxBays % 2) : maxBays;
  const perUnit = usableForN(raid, fullest, driveTB);
  const units = perUnit > 0 ? Math.ceil(targetTB / perUnit) : Infinity;
  return { drivesPerUnit: fullest, units, totalUsable: perUnit * units };
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

/** Drive capacities this chassis accepts (maxDriveTb is a hard per-bay ceiling). */
export function capsFor(model, capacities) {
  return capacities.filter((c) => !model.maxDriveTb || c <= model.maxDriveTb);
}

function makeBuild(model, raid, cap, line, drive, drivesPerUnit, units, totalUsable) {
  return {
    model,
    raid,
    driveCap: cap,
    driveLine: line,
    drive,
    drivesPerUnit,
    units,
    totalUsable,
    spareBays: model.bays - drivesPerUnit,
    totalQuote: model.quote * units + drive.quote * drivesPerUnit * units,
  };
}

const byPriceThenBoxesThenFit = (a, b) => a.totalQuote - b.totalQuote || a.units - b.units || a.totalUsable - b.totalUsable;

/** Every build that reaches targetTB, cheapest first. */
export function suggestBuilds({ targetTB, raid, models, hddPricing, capacities, brand, bays, expandableOnly, maxUnits = MAX_UNITS }) {
  const out = [];
  for (const model of models) {
    if (!modelMatches(model, { raid, brand, bays, expandableOnly })) continue;
    for (const cap of capsFor(model, capacities)) {
      const lines = hddPricing[cap] ?? {};
      for (const [line, drive] of Object.entries(lines)) {
        const calc = computeDrives(raid, cap, targetTB, model.bays);
        if (calc.units > maxUnits) continue;
        out.push(makeBuild(model, raid, cap, line, drive, calc.drivesPerUnit, calc.units, calc.totalUsable));
      }
    }
  }
  return out.sort(byPriceThenBoxesThenFit);
}

/** Keep the first (best) build per model, preserving order. */
export function bestBuildPerModel(builds) {
  const seen = new Set();
  return builds.filter((b) => (seen.has(b.model.id) ? false : (seen.add(b.model.id), true)));
}

/** Usable capacities that whole drives can actually deliver at this level. */
export function buildableSizes({ raid, models, capacities, hddPricing, brand, bays, expandableOnly, maxUnits = MAX_UNITS }) {
  const sizes = new Set();
  for (const model of models) {
    if (!modelMatches(model, { raid, brand, bays, expandableOnly })) continue;
    for (const cap of capsFor(model, capacities)) {
      if (!hddPricing[cap] || !Object.keys(hddPricing[cap]).length) continue;
      for (const n of driveCounts(raid, model.bays)) {
        const perUnit = usableForN(raid, n, cap);
        for (let units = 1; units <= maxUnits; units++) {
          const total = perUnit * units;
          if (total >= STORAGE_MIN && total <= STORAGE_MAX && Number.isInteger(total)) sizes.add(total);
        }
      }
    }
  }
  return [...sizes].sort((a, b) => a - b);
}

/** Closest buildable size; on a tie, the larger one (never under-deliver). */
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

/** Every build whose complete quote (hardware + extraCost) fits the budget, most usable space first. */
export function suggestBuildsForBudget({ budget, raid, extraCost = () => 0, models, hddPricing, capacities, brand, bays, expandableOnly, maxUnits = MAX_UNITS }) {
  const out = [];
  for (const model of models) {
    if (!modelMatches(model, { raid, brand, bays, expandableOnly })) continue;
    for (const cap of capsFor(model, capacities)) {
      for (const [line, drive] of Object.entries(hddPricing[cap] ?? {})) {
        for (const n of driveCounts(raid, model.bays)) {
          const perUnit = usableForN(raid, n, cap);
          const unitHardware = model.quote + drive.quote * n;
          for (let units = 1; units <= maxUnits; units++) {
            const hardware = unitHardware * units;
            // Each extra unit only costs more, so stop at the first overrun.
            if (hardware + extraCost(hardware, units) > budget) break;
            out.push(makeBuild(model, raid, cap, line, drive, n, units, perUnit * units));
          }
        }
      }
    }
  }
  return out.sort((a, b) => b.totalUsable - a.totalUsable || a.totalQuote - b.totalQuote || a.units - b.units);
}

/* ---------------- "Let us choose": the RAID level follows the drive count ---------------- */

/*
 * The level QNAP and Synology advise for a number of drives in one unit:
 *   2 drives    RAID 1  (QNAP: "recommended for NAS devices with two disks")
 *   3–5 drives  RAID 5  (one drive of parity; QNAP: "a good balance between data protection,
 *                        capacity, and speed"; Synology's SHR-1 is the same protection)
 *   6+ drives   RAID 6  (two drives of parity; Synology's SHR-2 advice. With more and larger
 *                        drives, a RAID 5 rebuild reads so much data that one unreadable
 *                        sector or a second failure loses the array; RAID 6 survives both)
 * RAID 10 is for databases and heavy random I/O, and RAID 0 has no protection, so neither
 * is ever chosen for the customer; both stay one click away.
 */
export const AUTO_RAID_LEVELS = ['RAID1', 'RAID5', 'RAID6'];

export function advisedRaid(drives) {
  if (drives <= 2) return 'RAID1';
  if (drives <= 5) return 'RAID5';
  return 'RAID6';
}

export const followsRaidAdvice = (b) => advisedRaid(b.drivesPerUnit) === b.raid;

/** Keep the builds that follow the advice (all of them if none can), then one box over several. */
function preferAdvised(builds) {
  const advised = builds.filter(followsRaidAdvice);
  const pool = advised.length ? advised : builds;
  const oneBox = pool.filter((b) => b.units === 1);
  return oneBox.length ? oneBox : pool;
}

/** Sizes buildable at any level "Let us choose" may pick. */
export function autoBuildableSizes(opts) {
  return [...new Set(AUTO_RAID_LEVELS.flatMap((raid) => buildableSizes({ ...opts, raid })))].sort((a, b) => a - b);
}

/** Capacity mode, "Let us choose": every advised build that reaches the target, at whichever
 *  level suits its drive count, cheapest first. Each build carries its own `raid`. */
export function suggestAutoBuilds(opts) {
  const all = AUTO_RAID_LEVELS.flatMap((raid) => suggestBuilds({ ...opts, raid }));
  return preferAdvised(all).sort(byPriceThenBoxesThenFit);
}

/**
 * Budget mode, "Let us choose": the advised build that turns the budget into the most usable
 * space, at whichever level suits its drive count. Only if nothing protected is affordable
 * does it fall back to RAID 0.
 */
export function suggestBudgetPlan(opts) {
  const all = AUTO_RAID_LEVELS.flatMap((raid) => suggestBuildsForBudget({ ...opts, raid }));
  if (all.length) {
    const builds = preferAdvised(all).sort((a, b) => b.totalUsable - a.totalUsable || a.totalQuote - b.totalQuote || a.units - b.units);
    return { raid: builds[0].raid, builds, redundant: true };
  }
  const raid0 = suggestBuildsForBudget({ ...opts, raid: 'RAID0' });
  return raid0.length ? { raid: 'RAID0', builds: raid0, redundant: false } : null;
}

/** The least a complete configuration can cost with these filters, or null if nothing can be built. */
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

/* ---------------- network ---------------- */

/** Fastest port speed in Gb/s parsed from a port string like "10GbE SFP+ ×2 + 2.5GbE ×2". */
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

/** Network is derived and displayed, never asked. */
export function networkFor(model) {
  if (!model) return null;
  const topGb = topSpeed(model.network);
  const speed = labelForSpeed(topGb);
  return { speed, quotable: speed === '—' ? null : speed, topGb, ports: model.network, builtIn: model.network || null, upgrade: model.networkUpgrade || null };
}

/** The fastest built-in network among a shortlist, e.g. for "need more throughput?" hints. */
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
