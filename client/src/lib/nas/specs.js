/* Specifications of a unit, and of the configuration built on it, as label/value pairs:
 * one source for the hover card, the specifications dialog and the comparison table, so
 * the three can't disagree. Same rules as the DGB India configurator.
 *
 * Only what the price list records, which is what the maker's own spec page says. A
 * specification nobody filled in is left out rather than guessed: these go to customers. */

import { RAID_INFO, inr } from './logic.js';

const raidList = (model) => (model.raid ?? []).map((r) => RAID_INFO[r]?.title ?? r).join(', ');

/** How far a unit grows with expansion attached: bays × largest drive, which is how the
 *  makers arrive at their own raw figures. Null when it doesn't expand or the bay total isn't on record. */
export function expansion(model) {
  if (!model.expandable || !model.baysWithExpansion || model.baysWithExpansion <= model.bays) return null;
  return { bays: model.baysWithExpansion, rawTb: model.maxDriveTb ? model.baysWithExpansion * model.maxDriveTb : null };
}

/** The same as a phrase, "9 bays · up to 216 TB raw", or the maker's note where no total is published. */
export function expansionLabel(model) {
  const grown = expansion(model);
  if (grown) return `${grown.bays} bays${grown.rawTb ? ` · up to ${grown.rawTb} TB raw` : ''}`;
  return model.expandable && model.expansionNote ? model.expansionNote : null;
}

export const expansionIsMeasured = (model) => expansion(model) !== null;

/** A short badge for the shortlist: "Expandable to 12 bays · 384 TB raw" or "Expandable via USB enclosure". */
export function expansionBadge(model) {
  if (!model.expandable) return null;
  const grown = expansion(model);
  if (grown) return `Expandable to ${grown.bays} bays${grown.rawTb ? ` · ${grown.rawTb} TB raw` : ''}`;
  if (/usb/i.test(model.expansionNote ?? '')) return 'Expandable via USB enclosure';
  return 'Expandable';
}

const row = (label, value) => (value == null || value === '' ? null : { label, value: String(value) });

function expansionText(model) {
  if (!model.expandable) return 'Not supported';
  if (expansionIsMeasured(model)) return `Grows to ${expansionLabel(model)}${model.expansionNote ? ` (${model.expansionNote})` : ''}`;
  return expansionLabel(model) ? `Supported: ${expansionLabel(model)}` : 'Supported';
}

/** The unit itself, independent of what's configured on it. */
export function modelSpecs(model) {
  return [
    row('Brand', model.brand),
    row('Drive bays', model.bays),
    row('Bays with expansion', model.baysWithExpansion),
    row('Processor', model.cpu),
    row('Cores', model.cpuCores),
    row('Memory', model.memory),
    row('Maximum memory', model.memoryMax),
    row('M.2 NVMe slots', model.m2Slots == null ? null : model.m2Slots || 'None'),
    row('Largest drive supported', model.maxDriveTb ? `${model.maxDriveTb} TB` : null),
    row('RAID levels', raidList(model) || '—'),
    row('Network ports', model.network || 'Not recorded'),
    row('Network upgrade', model.networkUpgrade || 'None'),
    row('USB ports', model.usbPorts),
    row('Expansion unit', expansionText(model)),
    row('Maximum raw capacity', model.maxRawTb ? `${model.maxRawTb} TB` : null),
    row('Dimensions', model.dimensions),
    row('Weight', model.weightKg ? `${model.weightKg} kg` : null),
    row('Warranty', model.warranty),
    row('Price per unit', inr(model.quote)),
  ].filter(Boolean);
}

/** The few that decide a shortlist: for the hover card. */
const KEY_LABELS = ['Drive bays', 'Processor', 'Memory', 'Network ports', 'Expansion unit'];
export function keySpecs(model) {
  const all = modelSpecs(model);
  const picked = KEY_LABELS.map((label) => all.find((s) => s.label === label)).filter(Boolean);
  return picked.length >= 3 ? picked : all.filter((s) => s.label !== 'Brand').slice(0, 5);
}

/* ---------------- drives ---------------- */

export const findLine = (lines, name) => lines.find((l) => l.name.toLowerCase() === String(name).trim().toLowerCase());

const CLASS_LABEL = { nas: 'NAS', enterprise: 'Enterprise' };
export const classLabel = (line) => CLASS_LABEL[line?.driveClass] ?? null;

export function driveLineSpecs(line) {
  return [
    row('Made by', line.brand),
    row('Class', classLabel(line)),
    row('Series', line.series),
    row('Spindle speed', line.rpm),
    row('Cache', line.cache),
    row('Interface', line.interface),
    row('Recording', line.recording),
    row('Workload rating', line.workloadTbYear),
    row('MTBF', line.mtbf),
    row('Warranty', line.warrantyYears ? `${line.warrantyYears} years` : null),
    row('Included', line.extras),
  ].filter(Boolean);
}

const DRIVE_KEY_LABELS = ['Class', 'Spindle speed', 'Workload rating', 'MTBF', 'Warranty'];
export function keyDriveSpecs(line) {
  const all = driveLineSpecs(line);
  const picked = DRIVE_KEY_LABELS.map((label) => all.find((s) => s.label === label)).filter(Boolean);
  return picked.length >= 3 ? picked : all.slice(0, 5);
}

/** The workload rating in TB/year ("Up to 180 TB/year" → 180), or null if it can't be read. */
function workloadTb(line) {
  const m = String(line.workloadTbYear ?? '').match(/(\d[\d,]*)\s*TB/i);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

/** What's worth saying about this drive family in this unit. Advisory only: every priced
 *  combination runs; these are the things a customer would otherwise find out after buying. */
export function driveNotes(model, line, drivesPerUnit) {
  const notes = [];
  if (!line) return notes;
  const madeFor = String(line.madeForBrand ?? '').trim();

  if (madeFor && madeFor.toLowerCase() !== model.brand.toLowerCase()) {
    notes.push({ tone: 'warn', text: `${line.name} drives are built and validated for ${madeFor} units. In a ${model.brand} unit they run as ordinary SATA drives, without the health reporting ${madeFor} adds, so a ${model.brand}-validated drive is the safer choice.` });
  } else if (madeFor) {
    notes.push({ tone: 'info', text: `Validated by ${madeFor} for this unit, with drive health and firmware updates handled inside ${madeFor}'s own software.` });
  } else if (model.brand.toLowerCase() === 'synology') {
    notes.push({ tone: 'info', text: `Synology validates its own drives for this unit. ${line.name} drives are supported and widely used, but Synology's software reports less detail about their health, and its support team may ask you to reproduce a fault on a validated drive.` });
  }

  const workload = workloadTb(line);
  if (workload != null && workload < 300 && drivesPerUnit > 8) {
    notes.push({ tone: 'warn', text: `${line.name} is rated for ${workload} TB of reads and writes a year. An array this size is usually busier than that: ${line.driveClass === 'nas' ? 'a Pro or enterprise drive' : 'a higher-rated drive'} is rated for the load and carries a longer warranty.` });
  }
  if (line.driveClass === 'enterprise' && drivesPerUnit <= 2) {
    notes.push({ tone: 'info', text: 'Enterprise drives spin at 7,200 rpm and are built for constant use. In a desk-side unit they are noticeably louder than a NAS drive, which is worth it if the unit runs around the clock.' });
  }
  if (model.maxDriveTb) {
    notes.push({ tone: 'info', text: `This unit takes drives up to ${model.maxDriveTb} TB each, so only those sizes are quoted for it.` });
  }
  return notes;
}

/** This configuration on that unit. */
export function buildSpecs(build, raid) {
  return [
    { label: 'Usable capacity', value: `${build.totalUsable} TB` },
    { label: 'RAID level', value: RAID_INFO[raid].title },
    { label: 'Drives', value: `${build.drivesPerUnit * build.units} × ${build.driveCap} TB ${build.driveLine}` },
    { label: 'Bays used', value: `${build.drivesPerUnit} of ${build.model.bays} per unit` },
    { label: 'Units', value: `${build.units}` },
    { label: 'Spare bays', value: `${build.spareBays * build.units}` },
    { label: 'Unit + drives', value: inr(build.totalQuote) },
  ];
}

/** One row per specification, one column per shortlisted unit. Every cell is filled:
 *  a blank would read as a missing feature. */
export function compareRows(builds, raid) {
  const rows = [
    ['Brand', (b) => b.model.brand],
    ['Drive bays', (b) => `${b.model.bays}`],
    ['Processor', (b) => b.model.cpu || 'Not recorded'],
    ['Cores', (b) => b.model.cpuCores || 'Not recorded'],
    ['Memory', (b) => b.model.memory || 'Not recorded'],
    ['Maximum memory', (b) => b.model.memoryMax || 'Not recorded'],
    ['M.2 NVMe slots', (b) => (b.model.m2Slots == null ? 'Not recorded' : b.model.m2Slots ? `${b.model.m2Slots}` : 'None')],
    ['Largest drive supported', (b) => (b.model.maxDriveTb ? `${b.model.maxDriveTb} TB` : 'Not recorded')],
    ['Usable capacity', (b) => `${b.totalUsable} TB`],
    ['Drives', (b) => `${b.drivesPerUnit * b.units} × ${b.driveCap} TB ${b.driveLine}`],
    ['Units', (b) => `${b.units}`],
    ['Spare bays', (b) => `${b.spareBays * b.units}`],
    ['RAID level', () => RAID_INFO[raid].title],
    ['RAID supported', (b) => raidList(b.model) || '—'],
    ['Network ports', (b) => b.model.network || 'Not recorded'],
    ['Network upgrade', (b) => b.model.networkUpgrade || 'None'],
    ['USB ports', (b) => b.model.usbPorts || 'Not recorded'],
    ['Expansion unit', (b) => expansionText(b.model)],
    ['Warranty', (b) => b.model.warranty || 'Not recorded'],
    ['Unit + drives', (b) => inr(b.totalQuote)],
  ];
  return rows.map(([label, get]) => ({ label, values: builds.map(get) }));
}
