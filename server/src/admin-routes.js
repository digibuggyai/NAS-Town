// Staff-only routes. Every route checks the role server side.
import { Router } from 'express';
import * as store from './db/store.js';
import { COLLECTIONS, SETTINGS_FIELDS, clean } from './db/collections.js';
import { PricingUnavailable, invalidatePricing, toSalesPricing } from './pricing.js';
import { hashPassword, requireAdmin, requireStaff } from './auth.js';

const router = Router();

const collectionOf = (req, res) => {
  const key = req.params.collection;
  if (!Object.hasOwn(COLLECTIONS, key)) {
    res.status(404).json({ error: 'Unknown collection.' });
    return null;
  }
  return key;
};

const labelOf = (key, row) =>
  ({ models: row.model, drives: `${row.capacityTb} TB ${row.line}`, driveLines: row.name, upgrades: row.name })[key] ?? String(row.id);

const show = (v) => (v == null ? null : Array.isArray(v) ? v.join(', ') : String(v));

function diff(before, after, keys) {
  return keys.filter((k) => show(before?.[k]) !== show(after?.[k]));
}

/** The whole catalogue including inactive items and floors, for the price manager. */
router.get('/nas', requireAdmin, async (_req, res) => {
  const [models, drives, driveLines, upgrades, settings] = await Promise.all([
    store.list('models'), store.list('drives'), store.list('driveLines'), store.list('upgrades'), store.getSettings(),
  ]);
  const schema = Object.fromEntries(Object.entries(COLLECTIONS).map(([k, c]) => [k, { label: c.label, fields: c.fields, required: c.required }]));
  res.json({ models, drives, driveLines, upgrades, settings, schema, settingsFields: SETTINGS_FIELDS });
});

/** The staff pricing payload: same shape as the public one, every figure with its floor. */
router.get('/nas/pricing', requireStaff, async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(await toSalesPricing());
  } catch (err) {
    if (err instanceof PricingUnavailable) return res.status(503).json({ error: 'Pricing is temporarily unavailable.' });
    throw err;
  }
});

router.patch('/nas/settings', requireAdmin, async (req, res) => {
  let data;
  try { data = clean(SETTINGS_FIELDS, req.body ?? {}); } catch (e) { return res.status(400).json({ error: e.message }); }
  const { before, after } = await store.updateSettings(data);
  await store.logChanges(diff(before, after, Object.keys(data)).map((field) => ({
    editor: req.user.email, collection: 'settings', itemLabel: 'Installation & AMC', field, before: show(before[field]), after: show(after[field]),
  })));
  invalidatePricing();
  res.json(after);
});

router.post('/nas/:collection', requireAdmin, async (req, res) => {
  const key = collectionOf(req, res);
  if (!key) return;
  const { fields, required } = COLLECTIONS[key];
  let data;
  try { data = clean(fields, req.body ?? {}); } catch (e) { return res.status(400).json({ error: e.message }); }
  const missing = required.filter((f) => data[f] == null);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  if (key === 'models' && !data.slug) data.slug = `${data.brand}-${data.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (key === 'models' && data.expandable == null) data.expandable = data.baysWithExpansion != null;
  let row;
  try { row = await store.create(key, data); } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'An item with that name already exists.' });
    throw e;
  }
  await store.logChanges([{ editor: req.user.email, collection: key, itemId: row.id, itemLabel: labelOf(key, row), field: '(created)', after: 'created' }]);
  invalidatePricing();
  res.status(201).json(row);
});

router.patch('/nas/:collection/:id', requireAdmin, async (req, res) => {
  const key = collectionOf(req, res);
  if (!key) return;
  let data;
  try { data = clean(COLLECTIONS[key].fields, req.body ?? {}); } catch (e) { return res.status(400).json({ error: e.message }); }
  const result = await store.update(key, Number(req.params.id), data);
  if (!result) return res.status(404).json({ error: 'Not found.' });
  const { before, after } = result;
  await store.logChanges(diff(before, after, Object.keys(data)).map((field) => ({
    editor: req.user.email, collection: key, itemId: after.id, itemLabel: labelOf(key, after), field, before: show(before[field]), after: show(after[field]),
  })));
  invalidatePricing();
  res.json(after);
});

router.delete('/nas/:collection/:id', requireAdmin, async (req, res) => {
  const key = collectionOf(req, res);
  if (!key) return;
  const before = await store.remove(key, Number(req.params.id));
  if (!before) return res.status(404).json({ error: 'Not found.' });
  await store.logChanges([{ editor: req.user.email, collection: key, itemId: before.id, itemLabel: labelOf(key, before), field: '(deleted)', before: 'existed', after: 'deleted' }]);
  invalidatePricing();
  res.json({ ok: true });
});

router.get('/change-log', requireAdmin, async (_req, res) => {
  res.json(await store.listChangeLog(300));
});

/** Internal price sheet with floors. Marked internal in the file itself. */
router.get('/price-sheet.csv', requireAdmin, async (_req, res) => {
  const [models, drives, upgrades, settings] = await Promise.all([store.list('models'), store.list('drives'), store.list('upgrades'), store.getSettings()]);
  const esc = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const rows = [
    ['INTERNAL - contains floor prices. Do not share outside the company.'],
    [],
    ['Kind', 'Item', 'Detail', 'Quote INR (GST incl.)', 'Floor INR', 'Active'],
    ...models.map((m) => ['NAS', `${m.brand} ${m.model}`, `${m.bays}-bay`, m.quotePrice, m.minPrice, m.active]),
    ...drives.map((d) => ['Drive', `${d.capacityTb} TB ${d.line}`, '', d.quotePrice, d.minPrice, d.active]),
    ...upgrades.map((u) => ['Upgrade', u.name, u.category, u.quotePrice, u.minPrice, u.active]),
    ['Service', 'Installation & setup', 'per chassis', settings.installQuote, settings.installMin, true],
    ['Service', 'AMC', '% of hardware per year', `${settings.amcQuotePercent}%`, settings.amcMinPercent != null ? `${settings.amcMinPercent}%` : '', true],
  ];
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="nastown-price-sheet-INTERNAL-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.set('Cache-Control', 'no-store');
  res.send('﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n'));
});

/* ---------------- users ---------------- */

router.get('/users', requireAdmin, async (_req, res) => res.json(await store.listUsers()));

router.post('/users', requireAdmin, async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const name = String(req.body?.name ?? '').trim().slice(0, 120) || null;
  const role = req.body?.role;
  const password = String(req.body?.password ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email.' });
  if (!['admin', 'sales'].includes(role)) return res.status(400).json({ error: 'Role must be admin or sales.' });
  if (password.length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters.' });
  if (await store.findUserByEmail(email)) return res.status(409).json({ error: 'That email already has an account.' });
  const user = await store.createUser({ email, name, role, passwordHash: hashPassword(password) });
  await store.logChanges([{ editor: req.user.email, collection: 'users', itemId: user.id, itemLabel: email, field: '(created)', after: role }]);
  res.status(201).json(user);
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.sub) return res.status(400).json({ error: 'You cannot remove your own account.' });
  await store.deleteUser(id);
  await store.logChanges([{ editor: req.user.email, collection: 'users', itemId: id, field: '(deleted)', after: 'deleted' }]);
  res.json({ ok: true });
});

/* ---------------- leads ---------------- */

router.get('/enquiries', requireStaff, async (_req, res) => res.json(await store.listEnquiries(200)));

export default router;
