import { Router } from 'express';
import * as store from './db/store.js';
import { recommend } from './finder.js';

const router = Router();

const ENQUIRY_TYPES = new Set(['contact', 'rental', 'service', 'configurator', 'expert']);
const clean = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

router.get('/health', (_req, res) => {
  res.json({ ok: true, database: store.usingDatabase ? 'postgres' : 'memory' });
});

router.get('/products', async (req, res) => {
  const { brand, featured, rentable } = req.query;
  res.json(await store.listProducts({
    brand: clean(brand, 40),
    featured: featured === 'true',
    rentable: rentable === 'true',
  }));
});

router.get('/products/:slug', async (req, res) => {
  const product = await store.getProduct(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/finder', async (req, res) => {
  const storing = clean(req.body?.storing, 40);
  const capacity = clean(req.body?.capacity, 40);
  const work_style = clean(req.body?.work_style, 40);
  if (!storing || !capacity || !work_style) {
    return res.status(400).json({ error: 'Please answer all three questions.' });
  }
  const matches = recommend(await store.listProducts(), { storing, capacity, work_style });
  await store.logFinder({ storing, capacity, work_style, recommended: matches.map((p) => p.slug) });
  res.json({ matches });
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
  const row = await store.createEnquiry({ type, name, email, phone, message: clean(b.message, 5000), payload });
  res.status(201).json({ ok: true, id: row.id });
});

export default router;
