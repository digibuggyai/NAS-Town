// Initial product catalogue. Specs are from manufacturer listings; prices are
// INDICATIVE PLACEHOLDERS in INR and must be verified before launch.
export const products = [
  {
    slug: 'synology-ds224-plus', brand: 'synology', model: 'Synology DS224+', bays: 2,
    cpu: 'Intel Celeron J4125 (4-core)', memory: '2 GB DDR4 (up to 6 GB)', network: '2 × 1GbE',
    key_spec: '2-bay · Intel quad-core', segment: 'home', use_cases: ['home', 'backup', 'photos'],
    max_raw_tb: 48, price_inr: 42000, featured: true, rentable: true,
    summary: 'A compact 2-bay NAS for a private home cloud, family photo backup and media streaming.',
  },
  {
    slug: 'synology-ds423-plus', brand: 'synology', model: 'Synology DS423+', bays: 4,
    cpu: 'Intel Celeron J4125 (4-core)', memory: '2 GB DDR4 (up to 6 GB)', network: '2 × 1GbE',
    key_spec: '4-bay · 2 × M.2 NVMe cache', segment: 'creator', use_cases: ['photos', 'backup', 'business'],
    max_raw_tb: 96, price_inr: 68000, featured: true, rentable: true,
    summary: 'A 4-bay system with NVMe caching for photographers and small teams.',
  },
  {
    slug: 'synology-ds923-plus', brand: 'synology', model: 'Synology DS923+', bays: 4,
    cpu: 'AMD Ryzen R1600 (2-core)', memory: '4 GB DDR4 ECC (up to 32 GB)', network: '2 × 1GbE, optional 10GbE',
    key_spec: '4-bay · 10GbE ready', segment: 'business', use_cases: ['videos', 'business', 'backup'],
    max_raw_tb: 216, price_inr: 82000, featured: false, rentable: true,
    summary: 'ECC memory and a 10GbE upgrade path for growing businesses and editing teams.',
  },
  {
    slug: 'synology-ds1522-plus', brand: 'synology', model: 'Synology DS1522+', bays: 5,
    cpu: 'AMD Ryzen R1600 (2-core)', memory: '8 GB DDR4 ECC (up to 32 GB)', network: '4 × 1GbE, optional 10GbE',
    key_spec: '5-bay · expandable to 15', segment: 'business', use_cases: ['business', 'surveillance', 'backup'],
    max_raw_tb: 360, price_inr: 98000, featured: false, rentable: false,
    summary: 'A 5-bay platform that scales to 15 drives with expansion units.',
  },
  {
    slug: 'qnap-ts-464', brand: 'qnap', model: 'QNAP TS-464', bays: 4,
    cpu: 'Intel Celeron N5095 (4-core)', memory: '8 GB DDR4 (up to 16 GB)', network: '2 × 2.5GbE',
    key_spec: '4-bay · dual 2.5GbE', segment: 'creator', use_cases: ['videos', 'photos', 'home'],
    max_raw_tb: 96, price_inr: 62000, featured: true, rentable: true,
    summary: 'Dual 2.5GbE, M.2 slots and a PCIe slot give creators room to grow.',
  },
  {
    slug: 'qnap-ts-873a', brand: 'qnap', model: 'QNAP TS-873A', bays: 8,
    cpu: 'AMD Ryzen V1500B (4-core)', memory: '8 GB DDR4 (up to 64 GB)', network: '2 × 2.5GbE',
    key_spec: '8-bay · Ryzen · 64 GB RAM max', segment: 'enterprise', use_cases: ['videos', 'business', 'surveillance'],
    max_raw_tb: 192, price_inr: 145000, featured: false, rentable: true,
    summary: 'An 8-bay Ryzen workhorse for virtualization, multi-editor video and heavy workloads.',
  },
  {
    slug: 'ugreen-dxp4800-plus', brand: 'ugreen', model: 'UGREEN NASync DXP4800 Plus', bays: 4,
    cpu: 'Intel Pentium Gold 8505 (5-core)', memory: '8 GB DDR5 (up to 64 GB)', network: '1 × 10GbE, 1 × 2.5GbE',
    key_spec: '4-bay · 10GbE built in', segment: 'creator', use_cases: ['videos', 'photos', 'home'],
    max_raw_tb: 136, price_inr: 72000, featured: true, rentable: false,
    summary: 'Built-in 10GbE and DDR5 for fast editing off the NAS.',
  },
  {
    slug: 'asustor-as5404t', brand: 'asustor', model: 'Asustor Nimbustor 4 Gen2 (AS5404T)', bays: 4,
    cpu: 'Intel Celeron N5105 (4-core)', memory: '16 GB DDR4', network: '2 × 2.5GbE',
    key_spec: '4-bay · 4 × M.2 NVMe', segment: 'creator', use_cases: ['videos', 'photos', 'home'],
    max_raw_tb: 96, price_inr: 58000, featured: false, rentable: false,
    summary: 'Four M.2 slots and 16 GB RAM, built for creators and streamers.',
  },
];
