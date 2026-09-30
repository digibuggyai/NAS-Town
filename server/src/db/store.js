// Data access. Uses PostgreSQL when DATABASE_URL is set; otherwise an in-memory
// store with the same interface, so the site runs locally without a database.
import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import pg from 'pg';
import { COLLECTIONS, SETTINGS_FIELDS, camel, snake } from './collections.js';
import * as catalogue from './catalogue.js';
import { blogSeed } from './blog-seed.js';
import { defaultPlacements } from '../placements.js';

const url = process.env.DATABASE_URL;
const pool = url
  ? new pg.Pool({
      connectionString: url,
      ssl: /localhost|127\.0\.0\.1|\.railway\.internal/.test(url) ? false : { rejectUnauthorized: false },
    })
  : null;

export const usingDatabase = Boolean(pool);

/* ---------------- floors (internal) ---------------- */

const FLOORS_FILE = new URL('./floors.local.json', import.meta.url);

export function readFloorsFile() {
  try {
    return JSON.parse(fs.readFileSync(FLOORS_FILE, 'utf8'));
  } catch {
    return null;
  }
}

/* ---------------- row mapping ---------------- */

function fromRow(fields, row) {
  if (!row) return null;
  const out = {};
  for (const [col, v] of Object.entries(row)) {
    const key = camel(col);
    out[key] = fields[key] === 'num' && v != null ? Number(v) : v;
  }
  return out;
}

/* ---------------- memory backend ---------------- */

const mem = { models: [], drives: [], driveLines: [], upgrades: [], settings: null, changeLog: [], users: [], enquiries: [], finder: [], blog: [], blogImages: new Map(), ids: {} };
const nextId = (k) => (mem.ids[k] = (mem.ids[k] ?? 0) + 1);

/* ---------------- init + seed ---------------- */

function seedRows(floors) {
  const models = catalogue.models.map((m) => ({ ...m, minPrice: floors?.models?.[m.model] ?? null }));
  const drives = catalogue.drives.map((d) => ({ ...d, minPrice: floors?.drives?.[`${d.capacityTb}|${d.line}`] ?? null }));
  const settings = {
    installQuote: catalogue.settings.installQuote,
    installMin: floors?.settings?.installMin ?? null,
    amcQuotePercent: catalogue.settings.amcQuotePercent,
    amcMinPercent: floors?.settings?.amcMinPercent ?? null,
  };
  return { models, drives, driveLines: catalogue.driveLines, upgrades: catalogue.upgrades, settings };
}

export async function init() {
  const floors = readFloorsFile();
  if (!floors) console.warn('[db] floors.local.json not found: floor prices will be empty until imported or entered in the admin panel.');

  if (!pool) {
    console.warn('[db] DATABASE_URL not set; using the in-memory store (data resets on restart).');
    const seed = seedRows(floors);
    for (const key of ['models', 'drives', 'driveLines', 'upgrades']) {
      mem[key] = seed[key].map((row) => ({ id: nextId(key), active: true, ...row }));
    }
    mem.settings = seed.settings;
    const placed = defaultPlacements([...mem.models].sort((a, b) => a.bays - b.bays || a.quotePrice - b.quotePrice));
    for (const m of mem.models) m.pages = placed.get(m.id);
    for (const p of blogSeed) await createPost(p);
    return;
  }

  const schema = await fsp.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await pool.query(schema);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM nas_models');
  if (rows[0].n === 0) {
    const seed = seedRows(floors);
    for (const key of ['models', 'drives', 'driveLines', 'upgrades']) {
      for (const row of seed[key]) await insertRow(key, row);
    }
    await pool.query(
      'INSERT INTO nas_settings (id, install_quote, install_min, amc_quote_percent, amc_min_percent) VALUES (1,$1,$2,$3,$4) ON CONFLICT (id) DO NOTHING',
      [seed.settings.installQuote, seed.settings.installMin, seed.settings.amcQuotePercent, seed.settings.amcMinPercent],
    );
    console.log(`[db] seeded ${seed.models.length} models, ${seed.drives.length} drives`);
  }
  const blog = await pool.query('SELECT COUNT(*)::int AS n FROM blog_posts');
  if (blog.rows[0].n === 0) {
    for (const p of blogSeed) await createPost(p);
    console.log(`[db] seeded ${blogSeed.length} blog posts`);
  }
  // Fill fields added after first release, without touching anything edited in the admin panel.
  for (const m of catalogue.models) {
    if (m.bestFor) await pool.query('UPDATE nas_models SET best_for = $1 WHERE model = $2 AND best_for IS NULL', [m.bestFor, m.model]);
  }
  // Models from before page placements existed keep the pages they were already shown on.
  const models = await list('models');
  if (models.some((m) => m.pages == null)) {
    const placed = defaultPlacements(models);
    for (const m of models.filter((x) => x.pages == null)) {
      await pool.query('UPDATE nas_models SET pages = $1 WHERE id = $2 AND pages IS NULL', [placed.get(m.id), m.id]);
    }
    console.log('[db] assigned default product pages');
  }
}

async function insertRow(key, data) {
  const { table, fields } = COLLECTIONS[key];
  const keys = Object.keys(data).filter((k) => k in fields);
  const cols = keys.map(snake);
  const { rows } = await pool.query(
    `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
    keys.map((k) => data[k]),
  );
  return fromRow(fields, rows[0]);
}

/* ---------------- catalogue CRUD ---------------- */

export async function list(key, { activeOnly = false } = {}) {
  const { table, fields, order } = COLLECTIONS[key];
  if (!pool) {
    const rows = mem[key].filter((r) => !activeOnly || r.active !== false);
    return structuredClone(rows);
  }
  const hasActive = 'active' in fields;
  const { rows } = await pool.query(`SELECT * FROM ${table} ${activeOnly && hasActive ? 'WHERE active' : ''} ORDER BY ${order}`);
  return rows.map((r) => fromRow(fields, r));
}

export async function get(key, id) {
  const { table, fields } = COLLECTIONS[key];
  if (!pool) return structuredClone(mem[key].find((r) => r.id === id) ?? null);
  const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return fromRow(fields, rows[0]);
}

export async function create(key, data) {
  if (!pool) {
    const row = { id: nextId(key), ...data };
    if ('active' in COLLECTIONS[key].fields && row.active == null) row.active = true;
    mem[key].push(row);
    return structuredClone(row);
  }
  return insertRow(key, data);
}

export async function update(key, id, data) {
  const before = await get(key, id);
  if (!before) return null;
  if (!pool) {
    const row = mem[key].find((r) => r.id === id);
    Object.assign(row, data);
    return { before, after: structuredClone(row) };
  }
  const { table, fields } = COLLECTIONS[key];
  const keys = Object.keys(data).filter((k) => k in fields);
  if (!keys.length) return { before, after: before };
  const sets = keys.map((k, i) => `${snake(k)} = $${i + 1}`);
  const { rows } = await pool.query(
    `UPDATE ${table} SET ${sets.join(', ')}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING *`,
    [...keys.map((k) => data[k]), id],
  );
  return { before, after: fromRow(fields, rows[0]) };
}

export async function remove(key, id) {
  const before = await get(key, id);
  if (!before) return null;
  if (!pool) {
    mem[key] = mem[key].filter((r) => r.id !== id);
    return before;
  }
  await pool.query(`DELETE FROM ${COLLECTIONS[key].table} WHERE id = $1`, [id]);
  return before;
}

/* ---------------- settings ---------------- */

export async function getSettings() {
  if (!pool) return structuredClone(mem.settings);
  const { rows } = await pool.query('SELECT * FROM nas_settings WHERE id = 1');
  const s = fromRow(SETTINGS_FIELDS, rows[0]);
  if (s) { delete s.id; delete s.updatedAt; }
  return s;
}

export async function updateSettings(data) {
  const before = await getSettings();
  if (!pool) {
    Object.assign(mem.settings, data);
    return { before, after: structuredClone(mem.settings) };
  }
  const keys = Object.keys(data).filter((k) => k in SETTINGS_FIELDS);
  if (keys.length) {
    await pool.query(
      `UPDATE nas_settings SET ${keys.map((k, i) => `${snake(k)} = $${i + 1}`).join(', ')}, updated_at = now() WHERE id = 1`,
      keys.map((k) => data[k]),
    );
  }
  return { before, after: await getSettings() };
}

/** Apply floor prices from floors.local.json (used by the import script). */
export async function applyFloors(floors) {
  let n = 0;
  for (const m of await list('models')) {
    const min = floors.models?.[m.model];
    if (min != null) { await update('models', m.id, { minPrice: min }); n++; }
  }
  for (const d of await list('drives')) {
    const min = floors.drives?.[`${d.capacityTb}|${d.line}`];
    if (min != null) { await update('drives', d.id, { minPrice: min }); n++; }
  }
  if (floors.settings) await updateSettings(floors.settings);
  return n;
}

/* ---------------- change log ---------------- */

export async function logChanges(entries) {
  if (!entries.length) return;
  if (!pool) {
    for (const e of entries) mem.changeLog.unshift({ id: nextId('changeLog'), createdAt: new Date().toISOString(), ...e });
    return;
  }
  for (const e of entries) {
    await pool.query(
      'INSERT INTO nas_change_log (editor, collection, item_id, item_label, field, before, after) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [e.editor, e.collection, e.itemId ?? null, e.itemLabel ?? null, e.field, e.before ?? null, e.after ?? null],
    );
  }
}

export async function listChangeLog(limit = 200) {
  if (!pool) return mem.changeLog.slice(0, limit);
  const { rows } = await pool.query('SELECT * FROM nas_change_log ORDER BY created_at DESC LIMIT $1', [limit]);
  return rows.map((r) => fromRow({}, r));
}

/* ---------------- users ---------------- */

export async function findUserByEmail(email) {
  if (!pool) return structuredClone(mem.users.find((u) => u.email === email) ?? null);
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return fromRow({}, rows[0]);
}

export async function listUsers() {
  const strip = ({ passwordHash, ...u }) => u;
  if (!pool) return mem.users.map(strip);
  const { rows } = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at');
  return rows.map((r) => fromRow({}, r));
}

export async function createUser({ email, name, role, passwordHash }) {
  if (!pool) {
    const u = { id: nextId('users'), email, name, role, passwordHash, createdAt: new Date().toISOString() };
    mem.users.push(u);
    return { id: u.id, email, name, role };
  }
  const { rows } = await pool.query(
    'INSERT INTO users (email, name, role, password_hash) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role, created_at',
    [email, name, role, passwordHash],
  );
  return fromRow({}, rows[0]);
}

export async function deleteUser(id) {
  if (!pool) { mem.users = mem.users.filter((u) => u.id !== id); return; }
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

export async function countAdmins() {
  if (!pool) return mem.users.filter((u) => u.role === 'admin').length;
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin'");
  return rows[0].n;
}

/* ---------------- offer coupons ---------------- */

// No 0/O or 1/I/L, so a code read out over the phone can't be misheard.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCouponCode = () => `NAS-${Array.from({ length: 6 }, () => CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join('')}`;

/**
 * The customer's coupon: the existing one for this email, or a new unique code.
 * Returns { code, valueInr, isNew }.
 */
export async function issueCoupon({ email, name, company, phone, valueInr }) {
  const key = email.toLowerCase();
  if (!pool) {
    mem.coupons ??= [];
    const found = mem.coupons.find((c) => c.email.toLowerCase() === key);
    if (found) return { code: found.code, valueInr: found.valueInr, isNew: false };
    let code;
    do code = newCouponCode(); while (mem.coupons.some((c) => c.code === code));
    mem.coupons.push({ id: nextId('coupons'), code, email, name, company, phone, valueInr, status: 'issued', createdAt: new Date() });
    return { code, valueInr, isNew: true };
  }
  const existing = await pool.query('SELECT code, value_inr FROM coupons WHERE lower(email) = $1', [key]);
  if (existing.rows[0]) return { code: existing.rows[0].code, valueInr: existing.rows[0].value_inr, isNew: false };
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO coupons (code, email, name, company, phone, value_inr) VALUES ($1,$2,$3,$4,$5,$6) RETURNING code, value_inr',
        [newCouponCode(), email, name, company, phone, valueInr],
      );
      return { code: rows[0].code, valueInr: rows[0].value_inr, isNew: true };
    } catch (e) {
      if (e.code !== '23505') throw e; // unique clash: the email raced us, or (rarely) the code exists
      const again = await pool.query('SELECT code, value_inr FROM coupons WHERE lower(email) = $1', [key]);
      if (again.rows[0]) return { code: again.rows[0].code, valueInr: again.rows[0].value_inr, isNew: false };
    }
  }
  throw new Error('Could not issue a coupon code.');
}

/* ---------------- leads ---------------- */

export async function createEnquiry({ type, name, email, phone, message, payload }) {
  if (!pool) {
    const row = { id: nextId('enquiries'), type, name, email, phone, message, payload, status: 'new', createdAt: new Date() };
    mem.enquiries.push(row);
    return row;
  }
  const { rows } = await pool.query(
    `INSERT INTO enquiries (type, name, email, phone, message, payload) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [type, name, email, phone, message, payload ?? {}],
  );
  return rows[0];
}

export async function listEnquiries(limit = 200) {
  if (!pool) return [...mem.enquiries].reverse().slice(0, limit);
  const { rows } = await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT $1', [limit]);
  return rows.map((r) => fromRow({}, r));
}

/** Removes a lead and returns what was removed (for the change log), or null. */
export async function deleteEnquiry(id) {
  if (!pool) {
    const i = mem.enquiries.findIndex((e) => e.id === id);
    return i === -1 ? null : mem.enquiries.splice(i, 1)[0];
  }
  const { rows } = await pool.query('DELETE FROM enquiries WHERE id = $1 RETURNING *', [id]);
  return rows[0] ? fromRow({}, rows[0]) : null;
}

export async function logFinder({ storing, capacity, work_style, recommended }) {
  if (!pool) { mem.finder.push({ storing, capacity, work_style, recommended, createdAt: new Date() }); return; }
  await pool.query(
    'INSERT INTO finder_submissions (storing, capacity, work_style, recommended) VALUES ($1,$2,$3,$4)',
    [storing, capacity, work_style, recommended],
  );
}

/* ---------------- blog ---------------- */

const POST_COLS = ['slug', 'title', 'excerpt', 'category', 'body', 'coverImage', 'coverAlt', 'published', 'publishedAt'];
const postRow = (r) => r && ({
  ...fromRow({}, r),
  publishedAt: r.published_at instanceof Date ? r.published_at.toISOString().slice(0, 10) : r.published_at ?? r.publishedAt,
});
const today = () => new Date().toISOString().slice(0, 10);

export async function listPosts({ publishedOnly = false, limit = 100 } = {}) {
  const sortKey = (p) => `${p.publishedAt}|${String(p.id).padStart(8, '0')}`;
  if (!pool) {
    return mem.blog
      .filter((p) => !publishedOnly || p.published)
      .sort((a, b) => sortKey(b).localeCompare(sortKey(a)))
      .slice(0, limit)
      .map((p) => structuredClone(p));
  }
  const { rows } = await pool.query(
    `SELECT * FROM blog_posts ${publishedOnly ? 'WHERE published' : ''} ORDER BY published_at DESC, id DESC LIMIT $1`,
    [limit],
  );
  return rows.map(postRow);
}

export async function getPost({ id, slug }) {
  if (!pool) return structuredClone(mem.blog.find((p) => (id != null ? p.id === id : p.slug === slug)) ?? null);
  const { rows } = await pool.query(`SELECT * FROM blog_posts WHERE ${id != null ? 'id' : 'slug'} = $1`, [id ?? slug]);
  return postRow(rows[0]) ?? null;
}

export async function createPost(data) {
  const row = { published: true, publishedAt: today(), body: '', ...data };
  if (!pool) {
    const p = { id: nextId('blog'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...row };
    mem.blog.push(p);
    return structuredClone(p);
  }
  const keys = POST_COLS.filter((k) => row[k] !== undefined);
  const { rows } = await pool.query(
    `INSERT INTO blog_posts (${keys.map(snake).join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
    keys.map((k) => row[k]),
  );
  return postRow(rows[0]);
}

export async function updatePost(id, data) {
  const before = await getPost({ id });
  if (!before) return null;
  if (!pool) {
    const p = mem.blog.find((x) => x.id === id);
    Object.assign(p, data, { updatedAt: new Date().toISOString() });
    return { before, after: structuredClone(p) };
  }
  const keys = POST_COLS.filter((k) => data[k] !== undefined);
  if (!keys.length) return { before, after: before };
  const { rows } = await pool.query(
    `UPDATE blog_posts SET ${keys.map((k, i) => `${snake(k)} = $${i + 1}`).join(', ')}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING *`,
    [...keys.map((k) => data[k]), id],
  );
  return { before, after: postRow(rows[0]) };
}

export async function deletePost(id) {
  const before = await getPost({ id });
  if (!before) return null;
  if (!pool) mem.blog = mem.blog.filter((p) => p.id !== id);
  else await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
  await deleteUnusedImage(before.coverImage);
  return before;
}

/* Cover images: stored as bytes; served at /api/blog/images/:id. */
export async function saveImage(mime, data) {
  if (!pool) {
    const id = nextId('blogImages');
    mem.blogImages.set(id, { mime, data });
    return id;
  }
  const { rows } = await pool.query('INSERT INTO blog_images (mime, data) VALUES ($1, $2) RETURNING id', [mime, data]);
  return rows[0].id;
}

export async function getImage(id) {
  if (!pool) return mem.blogImages.get(id) ?? null;
  const { rows } = await pool.query('SELECT mime, data FROM blog_images WHERE id = $1', [id]);
  return rows[0] ?? null;
}

/** Remove an uploaded cover once no post points at it any more. */
export async function deleteUnusedImage(url) {
  const m = /^\/api\/blog\/images\/(\d+)$/.exec(url ?? '');
  if (!m) return;
  const id = Number(m[1]);
  const inUse = (await listPosts()).some((p) => p.coverImage === url);
  if (inUse) return;
  if (!pool) mem.blogImages.delete(id);
  else await pool.query('DELETE FROM blog_images WHERE id = $1', [id]);
}
