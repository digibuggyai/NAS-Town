import { Router } from 'express';
import * as store from './db/store.js';
import { PricingUnavailable, toProduct, toPublicPricing } from './pricing.js';
import { issueToken, loginAllowed, requireSignedIn, verifyPassword } from './auth.js';

const router = Router();

const ENQUIRY_TYPES = new Set(['contact', 'rental', 'service', 'configurator', 'expert']);
const clean = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

router.get('/health', (_req, res) => {
  res.json({ ok: true, database: store.usingDatabase ? 'postgres' : 'memory' });
});

/** The public price list for the configurator. Never contains a floor price. */
router.get('/nas-pricing', async (_req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=60');
    res.json(await toPublicPricing());
  } catch (err) {
    if (err instanceof PricingUnavailable) return res.status(503).json({ error: 'Pricing is temporarily unavailable.' });
    throw err;
  }
});

async function products() {
  try {
    return (await toPublicPricing()).models.map(toProduct);
  } catch (err) {
    if (err instanceof PricingUnavailable) return [];
    throw err;
  }
}

router.get('/products', async (req, res) => {
  const { brand, featured, rentable, page } = req.query;
  const b = clean(brand, 40)?.toLowerCase();
  const pg = clean(page, 60); // a page key from placements.js, e.g. 'products' or 'solution:home'
  res.json((await products()).filter((p) =>
    (!b || p.brand === b) && (featured !== 'true' || p.featured) && (rentable !== 'true' || p.rentable)
    && (!pg || p.pages.includes(pg))));
});

router.get('/products/:slug', async (req, res) => {
  const product = (await products()).find((p) => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

/** The finder runs the engine in the browser; this only records what was asked and shown. */
router.post('/finder', async (req, res) => {
  const storing = clean(req.body?.storing, 40);
  const capacity = clean(req.body?.capacity, 40);
  const work_style = clean(req.body?.work_style, 40);
  if (!storing || !capacity || !work_style) return res.status(400).json({ error: 'Please answer all three questions.' });
  const recommended = Array.isArray(req.body?.recommended) ? req.body.recommended.slice(0, 5).map((s) => clean(String(s), 80)) : [];
  await store.logFinder({ storing, capacity, work_style, recommended });
  res.status(201).json({ ok: true });
});

router.post('/enquiries', async (req, res) => {
  const b = req.body ?? {};
  const type = clean(b.type, 40);
  const name = clean(b.name, 120);
  const email = clean(b.email, 200);
  const phone = clean(b.phone, 40);
  if (!ENQUIRY_TYPES.has(type)) return res.status(400).json({ error: 'Unknown enquiry type.' });
  if (!name) return res.status(400).json({ error: 'Please tell us your name.' });
  if (!email && !phone) return res.status(400).json({ error: 'Please add an email or phone number.' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'That email address does not look right.' });
  }
  const payload = b.payload && typeof b.payload === 'object' ? b.payload : {};
  if (JSON.stringify(payload).length > 20000) return res.status(400).json({ error: 'That request is too large.' });
  const row = await store.createEnquiry({ type, name, email, phone, message: clean(b.message, 5000), payload });
  res.status(201).json({ ok: true, id: row.id });
});

/* ---------------- offer coupons (configurator popups) ---------------- */

export const COUPON_VALUE_INR = 2000;

// 6 coupon requests per IP per 10 minutes: enough for a real customer, not for farming codes.
const offerHits = new Map();
function offerAllowed(ip) {
  const now = Date.now();
  const recent = (offerHits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  offerHits.set(ip, recent);
  return recent.length <= 6;
}

router.post('/offers', async (req, res) => {
  if (!offerAllowed(req.ip)) return res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' });
  const b = req.body ?? {};
  const name = clean(b.name, 120);
  const company = clean(b.company, 160) || null;
  const email = clean(b.email, 200);
  const phone = clean(b.phone, 40) || null;
  const source = ['intro', 'quote'].includes(b.source) ? b.source : 'intro';
  const summary = clean(b.summary, 4000) || null; // the configured quote, from the second popup
  const quoteTotal = Number.isFinite(Number(b.quoteTotal)) && Number(b.quoteTotal) > 0 ? Math.round(Number(b.quoteTotal)) : null;
  const message = clean(b.message, 1000) || null; // e.g. a lower price they found elsewhere
  if (!name) return res.status(400).json({ error: 'Please tell us your name.' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

  const coupon = await store.issueCoupon({
    email, name, company, phone, valueInr: COUPON_VALUE_INR, quoteTotal, quoteSummary: summary, message, source,
  });
  const intro = source === 'quote' ? 'Coupon requested with a configured quote.' : 'Asked for help choosing a NAS (coupon & call back).';
  await store.createEnquiry({
    type: 'offer',
    name,
    email,
    phone,
    message: company ? `${intro}\nCompany: ${company}` : intro,
    payload: {
      coupon: coupon.code,
      couponValue: coupon.valueInr,
      source,
      summary: [
        `Coupon ${coupon.code} (₹${coupon.valueInr.toLocaleString('en-IN')} off)${coupon.isNew ? '' : ', already issued to this email'}`,
        message && `Customer's message: ${message}`,
        summary,
      ].filter(Boolean).join('\n\n'),
    },
  });
  res.status(201).json({ code: coupon.code, valueInr: coupon.valueInr, isNew: coupon.isNew });
});

/* ---------------- staff sign-in ---------------- */

router.post('/auth/login', async (req, res) => {
  if (!loginAllowed(req.ip)) return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
  const email = clean(req.body?.email, 200)?.toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const user = email ? await store.findUserByEmail(email) : null;
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  res.json({ token: issueToken(user), user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get('/auth/me', requireSignedIn, (req, res) => {
  const { sub, email, name, role } = req.user;
  res.json({ user: { id: sub, email, name, role } });
});

export default router;
