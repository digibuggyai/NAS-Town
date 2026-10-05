// Customer reviews. Public: read published reviews, submit a new one (it waits for approval).
// Admin: list all, add (e.g. a real review received on Google/WhatsApp), edit, publish/hide,
// delete. Every admin change is recorded in the change log.
import { Router } from 'express';
import * as store from './db/store.js';
import { requireAdmin } from './auth.js';

export const publicReviews = Router();
export const adminReviews = Router();

export const REVIEW_STATUS = { pending: 'Waiting for approval', published: 'Published', hidden: 'Hidden' };
export const REVIEW_SOURCES = { website: 'Website', google: 'Google', whatsapp: 'WhatsApp', 'in-store': 'In person', email: 'Email' };

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

/** Validate a review. `partial` for edits (only the fields sent). Throws a readable message. */
function cleanReview(b, { partial = false, staff = false } = {}) {
  const out = {};
  const name = text(b.name, 80);
  if (name !== undefined || !partial) {
    if (!name) throw new Error('Please add a name.');
    out.name = name;
  }
  if (b.rating !== undefined || !partial) {
    const rating = Number(b.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Please choose a rating from 1 to 5 stars.');
    out.rating = rating;
  }
  const body = text(b.body, 2000);
  if (body !== undefined || !partial) {
    if (!body || body.length < 10) throw new Error('Please write at least a sentence (10+ characters).');
    out.body = body;
  }
  for (const [k, max] of [['city', 60], ['product', 120]]) {
    if (b[k] !== undefined) out[k] = text(b[k], max) || null;
  }
  if (b.email !== undefined) {
    const email = text(b.email, 200) || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('That email address does not look right.');
    out.email = email;
  }
  if (staff) {
    if (b.status !== undefined) {
      if (!Object.hasOwn(REVIEW_STATUS, b.status)) throw new Error('Unknown status.');
      out.status = b.status;
    }
    if (b.source !== undefined) {
      if (!Object.hasOwn(REVIEW_SOURCES, b.source)) throw new Error('Unknown source.');
      out.source = b.source;
    }
  }
  return out;
}

// What the public site may see: never the email.
const publicView = ({ id, name, city, product, rating, body, source, createdAt }) => ({ id, name, city, product, rating, body, source, createdAt });

/* ---------------- public ---------------- */

publicReviews.get('/reviews', async (_req, res) => {
  const reviews = (await store.listReviews({ publishedOnly: true })).map(publicView);
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  res.set('Cache-Control', 'no-cache');
  res.json({ reviews, count: reviews.length, average });
});

// 3 submissions per IP per hour: enough for real customers, not for spam.
const hits = new Map();
function allowed(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length <= 3;
}

publicReviews.post('/reviews', async (req, res) => {
  const b = req.body ?? {};
  if (b.website) return res.status(201).json({ ok: true }); // honeypot field: only bots fill it in
  if (!allowed(req.ip)) return res.status(429).json({ error: 'Thanks! You have sent a few reviews already. Please try again later.' });
  let data;
  try { data = cleanReview(b); } catch (e) { return res.status(400).json({ error: e.message }); }
  await store.createReview({ ...data, source: 'website', status: 'pending' });
  res.status(201).json({ ok: true });
});

/* ---------------- admin ---------------- */

const label = (r) => `${r.name} (${r.rating}★)`;
const show = (k, v) => (v == null || v === '' ? null : k === 'status' ? REVIEW_STATUS[v] ?? v : k === 'source' ? REVIEW_SOURCES[v] ?? v : String(v));

adminReviews.get('/reviews', requireAdmin, async (_req, res) => res.json(await store.listReviews()));

// Staff add a real review they received elsewhere. Published straight away unless they say otherwise.
adminReviews.post('/reviews', requireAdmin, async (req, res) => {
  let data;
  try { data = cleanReview(req.body ?? {}, { staff: true }); } catch (e) { return res.status(400).json({ error: e.message }); }
  const review = await store.createReview({ source: 'google', status: 'published', ...data });
  await store.logChanges([{ editor: req.user.email, collection: 'reviews', itemId: review.id, itemLabel: label(review), field: '(created)', after: `${show('source', review.source)} · ${show('status', review.status)}` }]);
  res.status(201).json(review);
});

adminReviews.patch('/reviews/:id', requireAdmin, async (req, res) => {
  let data;
  try { data = cleanReview(req.body ?? {}, { partial: true, staff: true }); } catch (e) { return res.status(400).json({ error: e.message }); }
  const result = await store.updateReview(Number(req.params.id), data);
  if (!result) return res.status(404).json({ error: 'Review not found.' });
  const { before, after } = result;
  const changed = Object.keys(data).filter((k) => show(k, before[k]) !== show(k, after[k]));
  if (changed.length) {
    await store.logChanges(changed.map((field) => ({
      editor: req.user.email, collection: 'reviews', itemId: after.id, itemLabel: label(after), field, before: show(field, before[field]), after: show(field, after[field]),
    })));
  }
  res.json(after);
});

adminReviews.delete('/reviews/:id', requireAdmin, async (req, res) => {
  const r = await store.deleteReview(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Review not found.' });
  const snapshot = [`${r.rating}★ · ${show('source', r.source)} · ${show('status', r.status)}`, [r.name, r.city, r.email].filter(Boolean).join(' · '), r.product && `Product: ${r.product}`, r.body].filter(Boolean).join('\n');
  await store.logChanges([{ editor: req.user.email, collection: 'reviews', itemId: r.id, itemLabel: label(r), field: '(deleted)', before: snapshot, after: 'deleted' }]);
  res.json({ ok: true });
});
