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
  const a = { ...INITIAL_ANSWERS, ...over };
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

test('20 TB RAID 5 → TS-433-4G + 3 × 10 TB IronWolf, ₹1,93,680 hw, ₹1,99,580 total', () => {
  const { b, price } = run({ targetTB: 20, raid: 'RAID5' });
  assert.equal(describe(b), 'TS-433-4G 3x10 IronWolf 20TB');
  assert.equal(price.hardware, 193680);
  assert.equal(price.total, 199580);
});

test('20 TB RAID 1 → one pair: TS-233-2G + 2 × 20 TB WD Ultrastar', () => {
  const { b, price } = run({ targetTB: 20, raid: 'RAID1' });
  assert.equal(describe(b), 'TS-233-2G 2x20 WD Ultrastar 20TB');
  assert.equal(price.hardware, 225958);
  assert.equal(price.total, 231858);
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

test('budget ₹2,00,000, RAID auto → RAID 5 at 20 TB', () => {
  const { d } = run({ storageMode: 'budget', budget: 200000, raidAuto: true });
  assert.equal(d.raid, 'RAID5');
  assert.equal(d.build.totalUsable, 20);
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
    [{ targetTB: 10, raid: 'RAID5' }, 'TS-433-4G 4x4 IronWolf 12TB', 152438, 139481],
    [{ targetTB: 20, raid: 'RAID6' }, 'TS-433-4G 4x10 IronWolf 20TB', 273464, 251600],
    [{ targetTB: 50, raid: 'RAID5' }, 'TS-664-8G 6x10 IronWolf 50TB', 428696, 395536],
    [{ targetTB: 50, raid: 'RAID6', brand: 'Synology' }, 'DS1825+ 7x10 IronWolf 50TB', 585512, 540735],
    [{ targetTB: 100, raid: 'RAID5' }, 'TS-664-8G 6x20 WD Ultrastar 100TB', 768061, 709923],
    [{ storageMode: 'budget', budget: 150000 }, 'TS-233-2G 2x10 IronWolf 10TB', 141332, 129127],
    [{ storageMode: 'budget', budget: 300000 }, 'TS-433-4G 4x10 IronWolf 30TB', 273464, 251600],
    [{ storageMode: 'budget', budget: 500000 }, 'TS-433-4G 4x20 WD Ultrastar 60TB', 499708, 461191],
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
