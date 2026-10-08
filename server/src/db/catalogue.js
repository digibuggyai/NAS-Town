// NAS catalogue seed, shared with DGB India: specs and quote prices come from
// catalogue.json (the DGB India export of 8 Oct 2026; quote prices only, GST inclusive).
// Floor prices are NOT here: they live in floors.local.json (gitignored) and are applied
// by seeding or `npm run import-floors`, or entered in the admin panel.
// NASTOWN adds its own copy per model (summary, best-for, featured, rentable) below.
import fs from 'node:fs';

const source = JSON.parse(fs.readFileSync(new URL('./catalogue.json', import.meta.url), 'utf8'));
export const exportedAt = source.exportedAt;

const NASTOWN_EXTRAS = {
  'TS-233-2G': { summary: 'An entry 2-bay NAS for home backup, photo libraries and simple file sharing.', bestFor: 'Home • Backup • Personal Cloud' },
  'DS223J': { summary: 'Synology DSM at its simplest: a quiet 2-bay personal cloud for the home.', bestFor: 'Home • Backup • Photo Library' },
  'TS-216G-4G': { summary: 'A 2-bay NAS with 2.5GbE for faster transfers at home or in a small office.', bestFor: 'Home • Small Office • Media' },
  'DS225+': { summary: 'A capable 2-bay Synology with 2.5GbE and an Intel CPU for media and backups.', bestFor: 'Home • Backup • Personal Cloud', featured: true },
  'DS725+': { summary: 'A compact 2-bay with Ryzen, ECC memory and NVMe slots that expands to 7 bays.', bestFor: 'Creators • Advanced Storage • Backup', featured: true },
  'TS-433-4G': { summary: 'The most affordable 4-bay route to RAID 5 and RAID 6 protection.', bestFor: 'Home • Small Office • RAID Protection', rentable: true },
  'TS-462-4G': { summary: 'A 4-bay Intel NAS with M.2 slots and a PCIe path to 10GbE.', bestFor: 'Small Business • Media • Backup' },
  'DS425+': { summary: 'A 4-bay Synology for photographers and small teams, with NVMe caching.', bestFor: 'Photographers • Small Teams • Backup', rentable: true },
  'TS-464-8G': { summary: 'Dual 2.5GbE, 8 GB RAM and room to expand to 12 bays: a strong creator NAS.', bestFor: 'Creators • Video Editing • Small Business', rentable: true },
  'DS925+': { summary: 'Ryzen, ECC memory and dual 2.5GbE for businesses that want Synology reliability.', bestFor: 'Creators • Business • High-Capacity Storage', featured: true },
  'DS1525+': { summary: 'A 5-bay business platform that scales to 15 drives, with a 10GbE upgrade.', bestFor: 'Business • Virtualisation • Scalable Storage', rentable: true },
  'TS-664-8G': { summary: 'Six bays for large media archives at a low cost per bay.', bestFor: 'Media Archives • Surveillance • Business' },
  'TS-832PX-4G': { summary: 'Eight bays with dual 10GbE SFP+ built in, for fast shared storage.', bestFor: '10GbE Teams • Video • Shared Storage' },
  'TS-873A-8G': { summary: 'An 8-bay Ryzen workhorse for virtualization, multi-editor video and heavy workloads.', bestFor: 'Enterprise • Virtualisation • Video Teams', rentable: true },
  'DS1825+': { summary: 'Synology’s 8-bay business NAS, expandable to 18 bays with a 25GbE path.', bestFor: 'Business • Enterprise • High-Capacity Storage' },
};

const slugOf = (brand, model) => `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const models = source.models.map(({ quote, ...m }) => ({
  slug: slugOf(m.brand, m.model),
  networkUpgrade: null,
  baysWithExpansion: null,
  expansionNote: null,
  featured: false,
  rentable: false,
  ...m,
  ...(NASTOWN_EXTRAS[m.model] ?? {}),
  quotePrice: quote,
  active: m.active !== false,
}));

export const drives = source.drives.map(({ capacityTb, line, quote, active }) => ({ capacityTb, line, quotePrice: quote, active: active !== false }));

export const driveLines = source.driveLines.map((l) => ({ madeForBrand: null, cache: null, extras: null, ...l }));

// Upgrades: none priced today. The configurator hides the step when this is empty.
export const upgrades = source.upgrades ?? [];

export const settings = source.settings;
