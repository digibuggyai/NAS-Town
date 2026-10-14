// Checks the configurator engine against the worked examples in the spec (§5, §7.6).
// Run: npm test (from server/). Uses the in-memory store seeded from the catalogue.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

delete process.env.DATABASE_URL;
const store = await import('../src/db/store.js');
const { toPublicPricing, toSalesPricing } = await import('../src/pricing.js');
const { derive, priceFor, INITIAL_ANSWERS } = await import('../../client/src/lib/nas/configure.js');
const { suggestBuilds, RAID_LEVELS } = await import('../../client/src/lib/nas/logic.js');

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

// Expected figures below are from the drive price list of 14 Oct 2026 (catalogue.json).
// 10 TB IronWolf and 10 TB WD Ultrastar now cost the same; the engine takes WD Ultrastar.
test('20 TB RAID 5 → TS-433-4G + 3 × 10 TB WD Ultrastar, ₹1,97,397 hw, ₹2,03,297 total', () => {
  const { b, price } = run({ targetTB: 20, raid: 'RAID5' });
  assert.equal(describe(b), 'TS-433-4G 3x10 WD Ultrastar 20TB');
  assert.equal(price.hardware, 197397);
  assert.equal(price.total, 203297);
});

test('20 TB RAID 1 → one pair: TS-233-2G + 2 × 20 TB WD Ultrastar', () => {
  const { b, price } = run({ targetTB: 20, raid: 'RAID1' });
  assert.equal(describe(b), 'TS-233-2G 2x20 WD Ultrastar 20TB');
  assert.equal(price.hardware, 247020);
  assert.equal(price.total, 252920);
});

test('4 TB RAID 5 → TS-433-4G + 3 × 2 TB IronWolf (no 2-bay)', () => {
  const { b, price } = run({ targetTB: 4, raid: 'RAID5' });
  assert.equal(describe(b), 'TS-433-4G 3x2 IronWolf 4TB');
  assert.equal(price.hardware, 104472);
  assert.equal(price.total, 110372);
});

test('4 TB RAID 0 → 2 × 2 TB, never 1 × 4 TB', () => {
  const { b, price } = run({ targetTB: 4, raid: 'RAID0' });
  assert.equal(describe(b), 'TS-233-2G 2x2 IronWolf 4TB');
  assert.equal(price.hardware, 63648);
  assert.equal(price.total, 69548);
});

test('budget ₹2,00,000, RAID auto → RAID 5 at 16 TB (3 × 8 TB Exos)', () => {
  const { d } = run({ storageMode: 'budget', budget: 200000, raidAuto: true });
  assert.equal(d.raid, 'RAID5');
  assert.equal(d.build.totalUsable, 16);
});

test('budget ₹2,00,000, RAID 6 forced → TS-433-4G + 4 × 4 TB IronWolf, 8 TB (6 TB drives no longer sold)', () => {
  const { b, price } = run({ storageMode: 'budget', budget: 200000, raidAuto: false, raid: 'RAID6' });
  assert.equal(describe(b), 'TS-433-4G 4x4 IronWolf 8TB');
  assert.equal(price.hardware, 134208);
  assert.equal(price.total, 140108);
});

test('budget ₹50,000 → no build, least is ₹69,548', () => {
  const { d } = run({ storageMode: 'budget', budget: 50000, raidAuto: true });
  assert.equal(d.build, null);
  assert.match(d.error, /₹69,548/);
});

test('§7.6 worked quotations with install + AMC, including floors', () => {
  const cases = [
    // DGB India spec §7.6 cases; quote prices of 14 Oct 2026, floors from floors.local.json
    [{ targetTB: 10, raid: 'RAID5' }, 'TS-433-4G 4x4 IronWolf 12TB', 153529, 139481],
    [{ targetTB: 20, raid: 'RAID5' }, 'TS-433-4G 3x10 WD Ultrastar 20TB', 223037, 204627],
    [{ targetTB: 20, raid: 'RAID6' }, 'TS-433-4G 4x10 WD Ultrastar 20TB', 278916, 256308],
    [{ targetTB: 20, raid: 'RAID1' }, 'TS-233-2G 2x20 WD Ultrastar 20TB', 277622, 245287],
    [{ targetTB: 50, raid: 'RAID5' }, 'TS-664-8G 6x10 WD Ultrastar 50TB', 436873, 402598],
    [{ targetTB: 50, raid: 'RAID6', brand: 'Synology' }, 'DS1825+ 7x10 WD Ultrastar 50TB', 595052, 548974],
    [{ targetTB: 100, raid: 'RAID5' }, 'TS-664-8G 6x20 WD Ultrastar 100TB', 837566, 744014],
    [{ storageMode: 'budget', budget: 150000 }, 'TS-233-2G 2x10 WD Ultrastar 10TB', 144058, 131481],
    [{ storageMode: 'budget', budget: 300000 }, 'TS-433-4G 4x10 WD Ultrastar 30TB', 278916, 256308],
    [{ storageMode: 'budget', budget: 500000 }, 'TS-433-4G 4x18 WD Ultrastar 54TB', 496980, 413212],
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

test('Let us choose: 20 TB → RAID 5 on TS-433-4G 3 × 10 TB; 10 TB → RAID 1 pair; 100 TB → RAID 6 on 6+ drives', () => {
  assert.equal(describe(run({ targetTB: 20 }).b), 'TS-433-4G 3x10 WD Ultrastar 20TB');
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

// One customer, one NAS: never several boxes. A size one NAS can't hold is an error with fixes,
// never a smaller quote and never more units.
test('every recommendation is a single NAS', () => {
  for (const over of [{ targetTB: 24, driveCap: 6 }, { targetTB: 24, bays: 2 }, { targetTB: 100 }, { targetTB: 168 }, { targetTB: 30, raid: 'RAID1' }, { storageMode: 'budget', budget: 2000000 }]) {
    const { d } = run(over);
    assert.ok(d.builds.every((b) => b.units === 1), `${JSON.stringify(over)} has a multi-unit build`);
  }
});

test('24 TB on 6 TB drives fits one NAS (not four 2-bay units)', () => {
  const { b } = run({ targetTB: 24, driveCap: 6 });
  assert.equal(b.units, 1);
  assert.ok(b.drivesPerUnit * b.driveCap >= 24);
});

test('too big for one NAS with these choices: an error with fixes, no smaller quote', () => {
  const { d } = run({ targetTB: 50, bays: 2 });
  assert.equal(d.build, null);
  assert.equal(d.tooBig.max, 30); // 2-bay QNAP with a pair of 30 TB Exos
  assert.ok(d.tooBig.fixes.some((f) => f.label === 'Any number of bays'));
});

test('bigger than any single NAS listed: points to expansion units', () => {
  const { d } = run({ targetTB: 200 });
  assert.equal(d.build, null);
  assert.equal(d.tooBig.expansion, true);
});

// The rule, across every kind of choice: sizes, budgets, each RAID choice, bay count, brand,
// "room to expand" and installation. Not one suggestion may be more than one NAS.
test('sweep: no choice ever produces more than one NAS', () => {
  const raids = [{ raidAuto: true }, ...RAID_LEVELS.map((raid) => ({ raidAuto: false, raid }))];
  const bays = [null, ...new Set(P.models.map((m) => m.bays))];
  const brands = ['any', ...new Set(P.models.map((m) => m.brand))];
  let checked = 0;
  for (const r of raids) for (const bay of bays) for (const brand of brands) for (const expandable of [false, true]) {
    const answers = [];
    for (let targetTB = 2; targetTB <= 200; targetTB += 3) answers.push({ storageMode: 'capacity', targetTB });
    for (let budget = 50000; budget <= 2000000; budget += 75000) answers.push({ storageMode: 'budget', budget, includeInstall: budget % 2 === 0 });
    for (const over of answers) {
      const { d } = run({ ...over, bays: bay, brand, expandable, ...r });
      for (const b of [...d.builds, ...d.options, d.build].filter(Boolean)) {
        checked++;
        assert.equal(b.units, 1, `${JSON.stringify({ ...over, bay, brand, expandable, ...r })}: ${b.model.model} × ${b.units}`);
        assert.ok(b.drivesPerUnit <= b.model.bays, `${b.model.model}: ${b.drivesPerUnit} drives in ${b.model.bays} bays`);
      }
    }
  }
  assert.ok(checked > 100000, `only ${checked} suggestions checked`);
});
