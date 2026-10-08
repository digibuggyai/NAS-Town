// Checks the configurator engine against the worked examples in the spec (§5, §7.6).
// Run: npm test (from server/). Uses the in-memory store seeded from the catalogue.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

delete process.env.DATABASE_URL;
const store = await import('../src/db/store.js');
const { toPublicPricing, toSalesPricing } = await import('../src/pricing.js');
const { derive, priceFor, INITIAL_ANSWERS } = await import('../../client/src/lib/nas/configure.js');
const { suggestBuilds } = await import('../../client/src/lib/nas/logic.js');

let P;
before(async () => {
  await store.init();
  P = await toSalesPricing();
});

const run = (over) => {
  // The spec's examples include installation; naming a level means the customer picked it.
  const a = { ...INITIAL_ANSWERS, includeInstall: true, ...(over.raid ? { raidAuto: false } : {}), ...over };
  const d = derive(a, P);
  return { a, d, b: d.build, price: priceFor(d.build, a, P) };
};
const describe = (b) => `${b.model.model} ${b.drivesPerUnit * b.units}x${b.driveCap} ${b.driveLine} ${b.totalUsable}TB`;

test('public payload carries no floor prices', async () => {
  const pub = await toPublicPricing();
  const json = JSON.stringify(pub);
  assert.ok(!/"min"/.test(json), 'no "min" key anywhere');
  assert.ok(!/minPrice/.test(json));
});

test('20 TB RAID 5 → TS-433-4G + 3 × 10 TB IronWolf, ₹1,95,540 hw, ₹2,01,440 total', () => {
  const { b, price } = run({ targetTB: 20, raid: 'RAID5' });
  assert.equal(describe(b), 'TS-433-4G 3x10 IronWolf 20TB');
  assert.equal(price.hardware, 195540);
  assert.equal(price.total, 201440);
});

test('20 TB RAID 1 → one pair: TS-233-2G + 2 × 20 TB Exos', () => {
  const { b, price } = run({ targetTB: 20, raid: 'RAID1' });
  assert.equal(describe(b), 'TS-233-2G 2x20 Exos 20TB');
  assert.equal(price.hardware, 229674);
  assert.equal(price.total, 235574);
});

test('4 TB RAID 5 → TS-433-4G + 3 × 2 TB IronWolf (no 2-bay)', () => {
  const { b, price } = run({ targetTB: 4, raid: 'RAID5' });
  assert.equal(describe(b), 'TS-433-4G 3x2 IronWolf 4TB');
  assert.equal(price.hardware, 101871);
  assert.equal(price.total, 107771);
});

test('4 TB RAID 0 → 2 × 2 TB, never 1 × 4 TB', () => {
  const { b, price } = run({ targetTB: 4, raid: 'RAID0' });
  assert.equal(describe(b), 'TS-233-2G 2x2 IronWolf 4TB');
  assert.equal(price.hardware, 61914);
  assert.equal(price.total, 67814);
});

test('budget ₹2,00,000, RAID auto → RAID 5 at 18 TB (not RAID 6 at 12 TB)', () => {
  const { d } = run({ storageMode: 'budget', budget: 200000, raidAuto: true });
  assert.equal(d.raid, 'RAID5');
  assert.equal(d.build.totalUsable, 18);
});

test('budget ₹2,00,000, RAID 6 forced → TS-433-4G + 4 × 6 TB WD Ultrastar, 12 TB', () => {
  const { b, price } = run({ storageMode: 'budget', budget: 200000, raidAuto: false, raid: 'RAID6' });
  assert.equal(describe(b), 'TS-433-4G 4x6 WD Ultrastar 12TB');
  assert.equal(price.hardware, 163944);
  assert.equal(price.total, 169844);
});

test('budget ₹50,000 → no build, least is ₹67,814', () => {
  const { d } = run({ storageMode: 'budget', budget: 50000, raidAuto: true });
  assert.equal(d.build, null);
  assert.match(d.error, /₹67,814/);
});

test('§7.6 worked quotations with install + AMC, including floors', () => {
  const cases = [
    // DGB India spec §7.6, catalogue of 8 Oct 2026
    [{ targetTB: 10, raid: 'RAID5' }, 'TS-433-4G 4x4 IronWolf 12TB', 152438, 139481],
    [{ targetTB: 20, raid: 'RAID5' }, 'TS-433-4G 3x10 IronWolf 20TB', 220994, 202990],
    [{ targetTB: 20, raid: 'RAID6' }, 'TS-433-4G 4x10 IronWolf 20TB', 276192, 254125],
    [{ targetTB: 20, raid: 'RAID1' }, 'TS-233-2G 2x20 Exos 20TB', 258541, 237711],
    [{ targetTB: 50, raid: 'RAID5' }, 'TS-664-8G 6x10 IronWolf 50TB', 432788, 399324],
    [{ targetTB: 50, raid: 'RAID6', brand: 'Synology' }, 'DS1825+ 7x10 IronWolf 50TB', 590286, 545154],
    [{ targetTB: 100, raid: 'RAID5' }, 'TS-664-8G 6x20 Exos 100TB', 780324, 721287],
    [{ storageMode: 'budget', budget: 150000 }, 'TS-233-2G 2x10 IronWolf 10TB', 142696, 130390],
    [{ storageMode: 'budget', budget: 300000 }, 'TS-433-4G 4x10 IronWolf 30TB', 276192, 254125],
    [{ storageMode: 'budget', budget: 500000 }, 'TS-433-4G 4x18 WD Ultrastar 54TB', 447915, 413212],
  ];
  for (const [over, expected, total, floor] of cases) {
    const { b, price } = run({ ...over, includeAMC: true });
    assert.equal(describe(b), expected, JSON.stringify(over));
    assert.equal(Math.round(price.total), total, `total ${JSON.stringify(over)}`);
    assert.equal(Math.round(price.floor.total), floor, `floor ${JSON.stringify(over)}`);
  }
});

test('invariants: RAID 0 never 1 drive, RAID 1 always 2, per-brand drive ceilings', () => {
  const catalogue = { models: P.models, hddPricing: P.hddPricing, capacities: P.capacities, brand: 'any', bays: null, expandableOnly: false };
  for (const target of [2, 4, 10, 20, 50, 100, 200]) {
    for (const raid of ['RAID0', 'RAID1', 'RAID5', 'RAID6', 'RAID10']) {
      for (const b of suggestBuilds({ targetTB: target, raid, ...catalogue })) {
        if (raid === 'RAID0') assert.ok(b.drivesPerUnit >= 2);
        if (raid === 'RAID1') assert.equal(b.drivesPerUnit, 2);
        if (raid === 'RAID10') assert.equal(b.drivesPerUnit % 2, 0);
        if (b.model.brand === 'Synology') assert.ok(b.driveCap <= 24);
        if (b.model.brand === 'QNAP') assert.ok(b.driveCap <= 32);
      }
    }
  }
});

// "Let us choose": the level follows the drive count (2 → RAID 1, 3–5 → RAID 5, 6+ → RAID 6),
// as QNAP and Synology advise; RAID 0 and RAID 10 are never chosen for the customer.
test('Let us choose: the RAID level always matches the drive count', () => {
  const advised = (n) => (n <= 2 ? 'RAID1' : n <= 5 ? 'RAID5' : 'RAID6');
  for (const targetTB of [4, 8, 10, 12, 16, 20, 24, 30, 40, 50, 60, 80, 100]) {
    const { d, b } = run({ targetTB });
    assert.ok(b, `${targetTB} TB builds`);
    assert.equal(d.raid, b.raid);
    assert.equal(b.raid, advised(b.drivesPerUnit), `${targetTB} TB: ${b.drivesPerUnit} drives at ${b.raid}`);
    for (const o of d.options) assert.equal(o.raid, advised(o.drivesPerUnit), `${targetTB} TB option ${o.model.model}`);
  }
});

test('Let us choose: 20 TB → RAID 5 on TS-433-4G 3 × 10 TB; 10 TB → RAID 1 pair; 100 TB → RAID 6 on 8 drives', () => {
  assert.equal(describe(run({ targetTB: 20 }).b), 'TS-433-4G 3x10 IronWolf 20TB');
  const ten = run({ targetTB: 10 });
  assert.equal(ten.d.raid, 'RAID1');
  assert.equal(ten.b.drivesPerUnit, 2);
  const hundred = run({ targetTB: 100 });
  assert.equal(hundred.d.raid, 'RAID6');
  assert.ok(hundred.b.drivesPerUnit >= 6);
});

test('Let us choose: a 2-bay filter gives a RAID 1 mirror', () => {
  const { d, b } = run({ targetTB: 20, bays: 2 });
  assert.equal(d.raid, 'RAID1');
  assert.equal(b.model.bays, 2);
});
