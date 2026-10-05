// Staff-only routes. Every route checks the role server side.
import { Router } from 'express';
import * as store from './db/store.js';
import { COLLECTIONS, SETTINGS_FIELDS, clean } from './db/collections.js';
import { PricingUnavailable, invalidatePricing, toSalesPricing } from './pricing.js';
import { ROLES, hashPassword, requireAdmin, requireStaff } from './auth.js';
import { NEW_MODEL_PAGES, PAGE_KEYS, PRODUCT_PAGES } from './placements.js';

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

/** Rejects page keys the site doesn't have, so a typo can't silently hide a product. */
function badPages(data) {
  const bad = (data.pages ?? []).filter((k) => !PAGE_KEYS.has(k));
  return bad.length ? `Unknown page: ${bad.join(', ')}` : null;
}

const PAGE_LABELS = Object.fromEntries(PRODUCT_PAGES.map((p) => [p.key, p.label]));
/** Page keys read as page names in the change log. */
const logValue = (field, v) => (field === 'pages' ? (v?.length ? v.map((k) => PAGE_LABELS[k] ?? k).join(', ') : 'none') : show(v));

function diff(before, after, keys) {
  return keys.filter((k) => show(before?.[k]) !== show(after?.[k]));
}

/** The whole catalogue including inactive items and floors, for the price manager. */
router.get('/nas', requireAdmin, async (_req, res) => {
  const [models, drives, driveLines, upgrades, settings] = await Promise.all([
    store.list('models'), store.list('drives'), store.list('driveLines'), store.list('upgrades'), store.getSettings(),
  ]);
  const schema = Object.fromEntries(Object.entries(COLLECTIONS).map(([k, c]) => [k, { label: c.label, fields: c.fields, required: c.required }]));
  res.json({ models, drives, driveLines, upgrades, settings, schema, settingsFields: SETTINGS_FIELDS, pages: PRODUCT_PAGES });
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
  if (key === 'models' && data.pages == null) data.pages = [...NEW_MODEL_PAGES];
  if (key === 'models' && badPages(data)) return res.status(400).json({ error: badPages(data) });
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
  if (key === 'models' && 'pages' in data && data.pages == null) data.pages = []; // cleared = on no pages
  if (key === 'models' && badPages(data)) return res.status(400).json({ error: badPages(data) });
  const result = await store.update(key, Number(req.params.id), data);
  if (!result) return res.status(404).json({ error: 'Not found.' });
  const { before, after } = result;
  await store.logChanges(diff(before, after, Object.keys(data)).map((field) => ({
    editor: req.user.email, collection: key, itemId: after.id, itemLabel: labelOf(key, after), field, before: logValue(field, before[field]), after: logValue(field, after[field]),
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
    ...drives.map((d) => ['Drive', `${d.capacityTb} TB ${d.line}`, d.partNumber ?? '', d.quotePrice, d.minPrice, d.active]),
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
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Choose a role: admin, sales or blog.' });
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

/* ---------------- coupons ---------------- */

// Which customer has which code, with their quote and message. Admin and sales.
router.get('/coupons', requireStaff, async (_req, res) => res.json(await store.listCoupons()));

export const COUPON_STATUS = { issued: 'Open', deal_done: 'Deal done', not_interested: 'Not interested' };
const couponLabel = (c) => `${c.code} · ${c.name ?? c.email}`;

// Mark the outcome (admin and sales). Every change is recorded in the change log.
router.patch('/coupons/:id', requireStaff, async (req, res) => {
  const status = req.body?.status;
  if (!Object.hasOwn(COUPON_STATUS, status)) return res.status(400).json({ error: 'Status must be issued, deal_done or not_interested.' });
  const result = await store.setCouponStatus(Number(req.params.id), status);
  if (!result) return res.status(404).json({ error: 'Coupon not found.' });
  const { before, after } = result;
  if (before.status !== after.status) {
    await store.logChanges([{
      editor: req.user.email, collection: 'coupons', itemId: after.id, itemLabel: couponLabel(after),
      field: 'status', before: COUPON_STATUS[before.status] ?? before.status, after: COUPON_STATUS[after.status],
    }]);
  }
  res.json(after);
});

// Admins only. A copy of the coupon goes into the change log, so it can be recovered.
router.delete('/coupons/:id', requireAdmin, async (req, res) => {
  const c = await store.deleteCoupon(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Coupon not found.' });
  const snapshot = [
    `${c.code} (₹${Number(c.valueInr).toLocaleString('en-IN')} off), status: ${COUPON_STATUS[c.status] ?? c.status}`,
    [c.name, c.company].filter(Boolean).join(', '),
    [c.email, c.phone].filter(Boolean).join(' · '),
    c.quoteTotal ? `Quote ₹${Number(c.quoteTotal).toLocaleString('en-IN')}` : null,
    c.message ? `Message: ${c.message}` : null,
  ].filter(Boolean).join('\n');
  await store.logChanges([{
    editor: req.user.email, collection: 'coupons', itemId: c.id, itemLabel: couponLabel(c), field: '(deleted)', before: snapshot, after: 'deleted',
  }]);
  res.json({ ok: true });
});

/* ---------------- leads ---------------- */

router.get('/enquiries', requireStaff, async (_req, res) => res.json(await store.listEnquiries(200)));

// Admins only. The lead's details are copied into the change log, so a deletion
// always shows who removed what and the contact can still be recovered.
router.delete('/enquiries/:id', requireAdmin, async (req, res) => {
  const lead = await store.deleteEnquiry(Number(req.params.id));
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  const contact = [lead.email, lead.phone].filter(Boolean).join(' · ');
  const snapshot = [
    `Received ${new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    contact,
    lead.message,
    lead.payload?.summary,
  ].filter(Boolean).join('\n').slice(0, 4000);
  await store.logChanges([{
    editor: req.user.email, collection: 'leads', itemId: lead.id,
    itemLabel: `${lead.type} lead: ${lead.name}`, field: '(deleted)', before: snapshot, after: 'deleted',
  }]);
  res.json({ ok: true });
});

export default router;
