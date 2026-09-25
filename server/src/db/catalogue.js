// NAS catalogue seed (snapshot 25 Sep 2026). Quote prices only, GST inclusive.
// Floor prices are NOT in this file: they live in floors.local.json (gitignored)
// and are applied by seeding or `npm run import-floors`, or entered in the admin panel.

const ALL = ['RAID0', 'RAID1', 'RAID5', 'RAID6', 'RAID10'];
const TWO = ['RAID0', 'RAID1'];

const m = (o) => ({
  slug: `${o.brand}-${o.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  expandable: o.baysWithExpansion != null,
  maxRawTb: o.bays * o.maxDriveTb,
  networkUpgrade: null,
  memoryMax: null,
  baysWithExpansion: null,
  warranty: null,
  featured: false,
  rentable: false,
  active: true,
  ...o,
});

export const models = [
  m({ model: 'TS-233-2G', bestFor: 'Home • Backup • Personal Cloud', brand: 'QNAP', bays: 2, raid: TWO, network: '1GbE ×1', cpu: 'ARM Cortex-A55', memory: '2 GB (on board)', memoryMax: 'not upgradable', m2Slots: 0, maxDriveTb: 32, warranty: '2 years, extendable to 5', quotePrice: 24000,
    summary: 'An entry 2-bay NAS for home backup, photo libraries and simple file sharing.' }),
  m({ model: 'DS223J', bestFor: 'Home • Backup • Photo Library', brand: 'Synology', bays: 2, raid: TWO, network: '1GbE ×1', cpu: 'Realtek RTD1619B', memory: '1 GB DDR4', memoryMax: 'not upgradable', m2Slots: 0, maxDriveTb: 24, warranty: '2 years, extendable to 4', quotePrice: 24000,
    summary: 'Synology DSM at its simplest: a quiet 2-bay personal cloud for the home.' }),
  m({ model: 'TS-216G-4G', bestFor: 'Home • Small Office • Media', brand: 'QNAP', bays: 2, raid: TWO, network: '2.5GbE ×1 + 1GbE ×1', cpu: 'ARM Cortex-A55', memory: '4 GB', m2Slots: 0, maxDriveTb: 32, warranty: '2 years, extendable to 5', quotePrice: 29000,
    summary: 'A 2-bay NAS with 2.5GbE for faster transfers at home or in a small office.' }),
  m({ model: 'DS225+', bestFor: 'Home • Backup • Personal Cloud', featured: true, brand: 'Synology', bays: 2, raid: TWO, network: '2.5GbE ×1 + 1GbE ×1', cpu: 'Intel Celeron J4125', memory: '2 GB DDR4', memoryMax: '6 GB', m2Slots: 0, maxDriveTb: 24, warranty: '3 years, extendable to 5', quotePrice: 42000, featured: true,
    summary: 'A capable 2-bay Synology with 2.5GbE and an Intel CPU for media and backups.' }),
  m({ model: 'DS725+', bestFor: 'Creators • Advanced Storage • Backup', featured: true, brand: 'Synology', bays: 2, raid: TWO, network: '2.5GbE ×1 + 1GbE ×1', cpu: 'AMD Ryzen R1600', memory: '4 GB DDR4 ECC', memoryMax: '32 GB', m2Slots: 2, maxDriveTb: 24, baysWithExpansion: 7, warranty: '3 years, extendable to 5', quotePrice: 94000,
    summary: 'A compact 2-bay with Ryzen, ECC memory and NVMe slots that expands to 7 bays.' }),
  m({ model: 'TS-433-4G', bestFor: 'Home • Small Office • RAID Protection', brand: 'QNAP', bays: 4, raid: ALL, network: '2.5GbE ×1 + 1GbE ×1', cpu: 'ARM Cortex-A55', memory: '4 GB (on board)', memoryMax: 'not upgradable', m2Slots: 0, maxDriveTb: 32, quotePrice: 45000, rentable: true,
    summary: 'The most affordable 4-bay route to RAID 5 and RAID 6 protection.' }),
  m({ model: 'TS-462-4G', bestFor: 'Small Business • Media • Backup', brand: 'QNAP', bays: 4, raid: ALL, network: '2.5GbE ×1', networkUpgrade: '10GbE via PCIe', cpu: 'Intel Celeron N4505', memory: '4 GB DDR4', memoryMax: '16 GB', m2Slots: 2, maxDriveTb: 32, quotePrice: 57000,
    summary: 'A 4-bay Intel NAS with M.2 slots and a PCIe path to 10GbE.' }),
  m({ model: 'DS425+', bestFor: 'Photographers • Small Teams • Backup', brand: 'Synology', bays: 4, raid: ALL, network: '2.5GbE ×1 + 1GbE ×1', cpu: 'Intel Celeron J4125', memory: '2 GB DDR4', memoryMax: '6 GB', m2Slots: 2, maxDriveTb: 24, warranty: '3 years, extendable to 5', quotePrice: 67000, rentable: true,
    summary: 'A 4-bay Synology for photographers and small teams, with NVMe caching.' }),
  m({ model: 'TS-464-8G', bestFor: 'Creators • Video Editing • Small Business', brand: 'QNAP', bays: 4, raid: ALL, network: '2.5GbE ×2', networkUpgrade: '10GbE via PCIe', cpu: 'Intel Celeron N5105', memory: '8 GB DDR4', memoryMax: '16 GB', m2Slots: 2, maxDriveTb: 32, baysWithExpansion: 12, quotePrice: 69000, rentable: true,
    summary: 'Dual 2.5GbE, 8 GB RAM and room to expand to 12 bays: a strong creator NAS.' }),
  m({ model: 'DS925+', bestFor: 'Creators • Business • High-Capacity Storage', featured: true, brand: 'Synology', bays: 4, raid: ALL, network: '2.5GbE ×2', cpu: 'AMD Ryzen V1500B', memory: '4 GB DDR4 ECC', memoryMax: '32 GB', m2Slots: 2, maxDriveTb: 24, baysWithExpansion: 9, warranty: '3 years, extendable to 5', quotePrice: 97000, featured: true,
    summary: 'Ryzen, ECC memory and dual 2.5GbE for businesses that want Synology reliability.' }),
  m({ model: 'DS1525+', bestFor: 'Business • Virtualisation • Scalable Storage', brand: 'Synology', bays: 5, raid: ALL, network: '2.5GbE ×2', networkUpgrade: '10GbE via E10G22-T1-Mini', cpu: 'AMD Ryzen V1500B', memory: '8 GB DDR4 ECC', memoryMax: '32 GB', m2Slots: 2, maxDriveTb: 24, baysWithExpansion: 15, warranty: '3 years, extendable to 5', quotePrice: 142000, rentable: true,
    summary: 'A 5-bay business platform that scales to 15 drives, with a 10GbE upgrade.' }),
  m({ model: 'TS-664-8G', bestFor: 'Media Archives • Surveillance • Business', brand: 'QNAP', bays: 6, raid: ALL, network: '2.5GbE ×2', networkUpgrade: '10GbE via PCIe', cpu: 'Intel Celeron N5095', memory: '8 GB DDR4', memoryMax: '16 GB', m2Slots: 2, maxDriveTb: 32, quotePrice: 87000,
    summary: 'Six bays for large media archives at a low cost per bay.' }),
  m({ model: 'TS-832PX-4G', bestFor: '10GbE Teams • Video • Shared Storage', brand: 'QNAP', bays: 8, raid: ALL, network: '10GbE SFP+ ×2 + 2.5GbE ×2', cpu: 'Annapurna Labs AL-324', memory: '4 GB DDR4', memoryMax: '16 GB', m2Slots: 0, maxDriveTb: 32, baysWithExpansion: 16, quotePrice: 108000,
    summary: 'Eight bays with dual 10GbE SFP+ built in, for fast shared storage.' }),
  m({ model: 'TS-873A-8G', bestFor: 'Enterprise • Virtualisation • Video Teams', brand: 'QNAP', bays: 8, raid: ALL, network: '2.5GbE ×2', networkUpgrade: '5/10GbE via PCIe Gen3', cpu: 'AMD Ryzen V1500B', memory: '8 GB DDR4', memoryMax: '64 GB', m2Slots: 2, maxDriveTb: 32, baysWithExpansion: 16, quotePrice: 130000, rentable: true,
    summary: 'An 8-bay Ryzen workhorse for virtualization, multi-editor video and heavy workloads.' }),
  m({ model: 'DS1825+', bestFor: 'Business • Enterprise • High-Capacity Storage', brand: 'Synology', bays: 8, raid: ALL, network: '2.5GbE ×2', networkUpgrade: 'up to 25GbE via PCIe', cpu: 'AMD Ryzen V1500B', memory: '8 GB DDR4 ECC', memoryMax: '32 GB', m2Slots: 2, maxDriveTb: 24, baysWithExpansion: 18, warranty: '3 years, extendable to 5', quotePrice: 180000,
    summary: 'Synology’s 8-bay business NAS, expandable to 18 bays with a 25GbE path.' }),
];

export const drives = [
  [2, 'Exos', 21683], [2, 'IronWolf', 18957],
  [4, 'Exos', 27510], [4, 'IronWolf', 22054],
  [6, 'WD Ultrastar', 29736],
  [8, 'Exos', 45224], [8, 'IronWolf Pro', 48321],
  [10, 'Exos', 52038], [10, 'IronWolf', 49560], [10, 'IronWolf Pro', 55136], [10, 'WD Ultrastar', 50180],
  [12, 'Exos', 68145], [12, 'IronWolf Pro', 67526], [12, 'WD Ultrastar', 67526],
  [16, 'Exos', 83633], [16, 'IronWolf Pro', 89828], [16, 'WD Ultrastar', 84872],
  [18, 'WD Ultrastar', 87969],
  [20, 'Exos', 102837], [20, 'IronWolf Pro', 106554], [20, 'WD Ultrastar', 100979],
  [24, 'WD Ultrastar', 118944],
].map(([capacityTb, line, quotePrice]) => ({ capacityTb, line, quotePrice, active: true }));

export const driveLines = [
  { name: 'IronWolf', brand: 'Seagate', driveClass: 'NAS', madeForBrand: null, series: 'IronWolf', rpm: '5,400–7,200', cache: '64–256 MB', interface: 'SATA 6 Gb/s', recording: 'CMR', workloadTbYear: '180 TB/year', mtbf: '1M hours', warrantyYears: 3, bestFor: 'Home and small-office NAS', sortOrder: 1 },
  { name: 'IronWolf Pro', brand: 'Seagate', driveClass: 'NAS', madeForBrand: null, series: 'IronWolf Pro', rpm: '7,200', cache: '256–512 MB', interface: 'SATA 6 Gb/s', recording: 'CMR', workloadTbYear: '300 TB/year (550 at 24 TB+)', mtbf: '1.2M hours (2.5M at 24 TB+)', warrantyYears: 5, bestFor: 'Busy business NAS and creative teams', sortOrder: 2 },
  { name: 'Exos', brand: 'Seagate', driveClass: 'Enterprise', madeForBrand: null, series: 'Exos X', rpm: '7,200', cache: '256–512 MB', interface: 'SATA 6 Gb/s (SAS available)', recording: 'CMR', workloadTbYear: '550 TB/year', mtbf: '2.5M hours', warrantyYears: 5, bestFor: '24/7 enterprise and surveillance workloads', sortOrder: 3 },
  { name: 'WD Ultrastar', brand: 'Western Digital', driveClass: 'Enterprise', madeForBrand: null, series: 'DC HC560/HC580', rpm: '7,200', cache: '512 MB', interface: 'SATA 6 Gb/s (SAS available)', recording: 'CMR', workloadTbYear: '550 TB/year', mtbf: 'up to 2.5M hours', warrantyYears: 5, bestFor: 'High-capacity enterprise storage', sortOrder: 4 },
  { name: 'Synology Plus', brand: 'Synology', driveClass: 'NAS', madeForBrand: 'Synology', series: 'HAT3300/3310/3320', rpm: '5,400 (2–6 TB), 7,200 (8–20 TB)', cache: null, interface: 'SATA 6 Gb/s', recording: 'CMR', workloadTbYear: '180 TB/year (up to 300)', mtbf: 'up to 1.2M hours', warrantyYears: 3, bestFor: 'Synology Plus-series units', sortOrder: 5 },
  { name: 'Synology Enterprise', brand: 'Synology', driveClass: 'Enterprise', madeForBrand: 'Synology', series: 'HAT5300/5310/5320', rpm: '7,200', cache: null, interface: 'SATA 6 Gb/s', recording: 'CMR', workloadTbYear: '550 TB/year', mtbf: 'up to 2.5M hours', warrantyYears: 5, bestFor: 'Synology business units', sortOrder: 6 },
];

// Upgrades: none priced today. The configurator hides the step when this is empty.
export const upgrades = [];

export const settings = { installQuote: 5900, amcQuotePercent: 10 };
