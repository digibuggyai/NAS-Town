/* Specification rows, the comparison table and drive compatibility notes. Pure functions. */
import { RAID_INFO, networkFor } from './logic.js';

export function modelSpecRows(m) {
  const net = networkFor(m);
  return [
    ['Brand', m.brand],
    ['Drive bays', m.baysWithExpansion ? `${m.bays} (${m.baysWithExpansion} with expansion)` : m.bays],
    ['RAID levels', m.raid.map((r) => RAID_INFO[r].title.replace('RAID ', '')).join(' / ')],
    ['Processor', m.cpu],
    ['Memory', m.memoryMax ? `${m.memory} (max ${m.memoryMax})` : m.memory],
    ['M.2 slots', m.m2Slots || 'None'],
    ['Network', net.ports],
    ['Network upgrade', net.upgrade ?? 'None'],
    ['Largest drive', m.maxDriveTb ? `${m.maxDriveTb} TB per bay` : null],
    ['Warranty', m.warranty],
  ].filter(([, v]) => v != null && v !== '');
}

/** Side-by-side rows for the shortlist: [label, ...one value per build]. */
export function compareRows(builds, priceOf) {
  return [
    ['Bays', ...builds.map((b) => b.model.bays)],
    ['Drives', ...builds.map((b) => `${b.drivesPerUnit * b.units} × ${b.driveCap} TB`)],
    ['Units', ...builds.map((b) => b.units)],
    ['Usable', ...builds.map((b) => `${b.totalUsable} TB`)],
    ['Spare bays', ...builds.map((b) => b.spareBays)],
    ['Network', ...builds.map((b) => networkFor(b.model).speed)],
    ['Processor', ...builds.map((b) => b.model.cpu)],
    ['Memory', ...builds.map((b) => b.model.memory)],
    ['Expandable', ...builds.map((b) => (b.model.expandable ? `Yes, to ${b.model.baysWithExpansion} bays` : 'No'))],
    ['Estimate', ...builds.map((b) => priceOf(b))],
  ];
}

export function driveLineRows(l) {
  return [
    ['Maker', l.brand],
    ['Class', l.driveClass],
    ['Series', l.series],
    ['Speed', l.rpm ? `${l.rpm} rpm` : null],
    ['Cache', l.cache],
    ['Recording', l.recording],
    ['Workload', l.workloadTbYear],
    ['MTBF', l.mtbf],
    ['Warranty', l.warrantyYears ? `${l.warrantyYears} years` : null],
    ['Interface', l.interface],
  ].filter(([, v]) => v != null && v !== '');
}

/** "180 TB/year" → 180; null when the figure can't be read (the rule then stays silent). */
export function parseWorkload(text) {
  const m = String(text ?? '').match(/(\d+(?:\.\d+)?)\s*TB/i);
  return m ? Number(m[1]) : null;
}

/** Advisory notes only: they never block a configuration. */
export function compatibilityNotes(build, line) {
  if (!build) return [];
  const m = build.model;
  const notes = [];
  if (line?.madeForBrand) {
    notes.push(
      line.madeForBrand === m.brand
        ? `Validated for ${m.brand}: drive health is reported in ${m.brand}'s own software.`
        : `${line.name} drives are made for ${line.madeForBrand} units and lose their health integration in a ${m.brand} box.`,
    );
  } else if (m.brand === 'Synology') {
    notes.push('Third-party drives are supported, with less health detail. Synology support may ask to reproduce an issue on a validated drive.');
  }
  const workload = parseWorkload(line?.workloadTbYear);
  const arrayDrives = build.drivesPerUnit;
  if (workload != null && workload < 300 && arrayDrives > 8) {
    notes.push(`An array of ${arrayDrives} drives is likely busier than the ${workload} TB/year these drives are rated for.`);
  }
  if (line?.driveClass === 'Enterprise' && m.bays <= 2) {
    notes.push('Enterprise 7,200 rpm drives are noticeably louder on a desk.');
  }
  if (m.maxDriveTb) notes.push(`The ${m.model} takes drives up to ${m.maxDriveTb} TB per bay.`);
  return notes;
}
