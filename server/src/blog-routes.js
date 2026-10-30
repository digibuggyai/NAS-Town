// Blog API. Public: read published posts and cover images. Admin: full CRUD + cover upload.
import express, { Router } from 'express';
import * as store from './db/store.js';
import { requireBlog } from './auth.js';
import { bodyHtml, plainText } from './blog-html.js';

export const publicBlog = Router();
export const adminBlog = Router();

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);
const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'post';
const words = (s = '') => (plainText(s).match(/\S+/g) ?? []).length;
const readMins = (p) => Math.max(1, Math.round(words(p.body) / 200));
// List views don't need the full body.
const summary = ({ body, ...p }) => ({ ...p, readMins: readMins({ body }) });

async function uniqueSlug(base, exceptId) {
  let slug = base;
  for (let n = 2; ; n++) {
    const found = await store.getPost({ slug });
    if (!found || found.id === exceptId) return slug;
    slug = `${base}-${n}`;
  }
}

/** Extra JSON-LD from the editor: one schema object or a list of them, each with an @type.
 * Stored re-serialised, so what reaches the page is always valid JSON. */
function cleanSchema(v) {
  const raw = typeof v === 'string' ? v.trim() : '';
  if (!raw) return null;
  if (raw.length > 30000) throw new Error('Schema is too long (30,000 characters at most).');
  let data;
  try { data = JSON.parse(raw); } catch (e) { throw new Error(`Schema is not valid JSON: ${e.message}`); }
  const list = Array.isArray(data) ? data : data?.['@graph'] ? data['@graph'] : [data];
  if (!list.length || list.some((x) => !x || typeof x !== 'object' || Array.isArray(x) || !x['@type'])) {
    throw new Error('Schema must be a JSON-LD object (or a list of them), each with an "@type".');
  }
  return JSON.stringify(list.map((x) => ({ '@context': 'https://schema.org', ...x })));
}

/** Validate and normalise an incoming post. `partial` allows updates with only some fields. */
function cleanPost(b, { partial = false } = {}) {
  const out = {};
  const title = text(b.title, 200);
  if (title !== undefined) out.title = title;
  if (!partial && !title) throw new Error('A title is required.');
  if (b.slug !== undefined) out.slug = slugify(b.slug || b.title || '');
  for (const [k, max] of [['excerpt', 400], ['category', 60], ['coverAlt', 200]]) {
    if (b[k] !== undefined) out[k] = text(b[k], max) || null;
  }
  if (b.body !== undefined) out.body = bodyHtml(text(b.body, 200000) ?? '');
  if (b.published !== undefined) out.published = b.published === true || b.published === 'true';
  if (b.publishedAt !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.publishedAt))) throw new Error('Publish date must be YYYY-MM-DD.');
    out.publishedAt = b.publishedAt;
  }
  // SEO. Empty means "use the title / excerpt".
  for (const [k, max] of [['metaTitle', 120], ['metaDescription', 320], ['metaKeywords', 300]]) {
    if (b[k] !== undefined) out[k] = text(b[k], max)?.replace(/\s+/g, ' ') || null;
  }
  if (b.faqs !== undefined) {
    if (b.faqs != null && !Array.isArray(b.faqs)) throw new Error('FAQs must be a list.');
    const faqs = (b.faqs ?? [])
      .map((f) => ({ q: text(f?.q, 300) ?? '', a: text(f?.a, 3000) ?? '' }))
      .filter((f) => f.q || f.a);
    if (faqs.some((f) => !f.q || !f.a)) throw new Error('Each FAQ needs both a question and an answer.');
    if (faqs.length > 30) throw new Error('At most 30 FAQs per post.');
    out.faqs = faqs.length ? faqs : null;
  }
  if (b.schemaJson !== undefined) out.schemaJson = cleanSchema(b.schemaJson);
  if (b.coverImage !== undefined) {
    const c = text(b.coverImage, 500) || null;
    if (c && !/^(\/images\/[\w./-]+|\/api\/blog\/images\/\d+|https:\/\/[^\s]+)$/.test(c)) throw new Error('Cover image must be an uploaded image or an https:// link.');
    out.coverImage = c;
  }
  return out;
}

/* ---------------- public ---------------- */

publicBlog.get('/blog', async (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 50);
  // Always revalidate, so a post published in admin shows up immediately.
  res.set('Cache-Control', 'no-cache');
  res.json((await store.listPosts({ publishedOnly: true, limit })).map(summary));
});

publicBlog.get('/blog/images/:id', async (req, res) => {
  const img = await store.getImage(Number(req.params.id));
  if (!img) return res.status(404).end();
  res.set('Content-Type', img.mime);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(Buffer.from(img.data));
});

publicBlog.get('/blog/:slug', async (req, res) => {
  const post = await store.getPost({ slug: String(req.params.slug) });
  if (!post || !post.published) return res.status(404).json({ error: 'Post not found.' });
  res.json({ ...post, body: bodyHtml(post.body), readMins: readMins(post) });
});

/* ---------------- admin ---------------- */

adminBlog.get('/blog', requireBlog, async (_req, res) => {
  res.json((await store.listPosts({ limit: 500 })).map((p) => ({ ...p, body: bodyHtml(p.body), readMins: readMins(p) })));
});

adminBlog.post('/blog/images', requireBlog, express.raw({ type: [...IMAGE_TYPES], limit: MAX_IMAGE_BYTES }), async (req, res) => {
  const mime = req.get('content-type');
  if (!IMAGE_TYPES.has(mime) || !Buffer.isBuffer(req.body) || !req.body.length) {
    return res.status(400).json({ error: 'Upload a JPG, PNG, WebP or AVIF image (max 3 MB).' });
  }
  const id = await store.saveImage(mime, req.body);
  await store.logChanges([{
    editor: req.user.email, collection: 'blog', itemId: id, itemLabel: `Cover image #${id}`, field: '(uploaded)',
    after: `${mime.replace('image/', '').toUpperCase()}, ${Math.round(req.body.length / 1024)} KB`,
  }]);
  res.status(201).json({ url: `/api/blog/images/${id}` });
});

adminBlog.post('/blog', requireBlog, async (req, res) => {
  let data;
  try { data = cleanPost(req.body ?? {}); } catch (e) { return res.status(400).json({ error: e.message }); }
  data.slug = await uniqueSlug(data.slug || slugify(data.title));
  const post = await store.createPost(data);
  await store.logChanges([{ editor: req.user.email, collection: 'blog', itemId: post.id, itemLabel: post.title, field: '(created)', after: post.published ? 'published' : 'draft' }]);
  res.status(201).json(post);
});

adminBlog.patch('/blog/:id', requireBlog, async (req, res) => {
  const id = Number(req.params.id);
  let data;
  try { data = cleanPost(req.body ?? {}, { partial: true }); } catch (e) { return res.status(400).json({ error: e.message }); }
  if (data.slug) data.slug = await uniqueSlug(data.slug, id);
  const result = await store.updatePost(id, data);
  if (!result) return res.status(404).json({ error: 'Post not found.' });
  const { before, after } = result;
  if (before.coverImage !== after.coverImage) await store.deleteUnusedImage(before.coverImage);
  const changed = Object.keys(data).filter((k) => String(before[k] ?? '') !== String(after[k] ?? ''));
  await store.logChanges(changed.map((field) => ({
    editor: req.user.email, collection: 'blog', itemId: id, itemLabel: after.title, field,
    before: field === 'body' ? `${words(before.body)} words` : String(before[field] ?? ''),
    after: field === 'body' ? `${words(after.body)} words` : String(after[field] ?? ''),
  })));
  res.json(after);
});

adminBlog.delete('/blog/:id', requireBlog, async (req, res) => {
  const before = await store.deletePost(Number(req.params.id));
  if (!before) return res.status(404).json({ error: 'Post not found.' });
  await store.logChanges([{ editor: req.user.email, collection: 'blog', itemId: before.id, itemLabel: before.title, field: '(deleted)', before: 'existed', after: 'deleted' }]);
  res.json({ ok: true });
});
