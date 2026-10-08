// Data access. Uses PostgreSQL when DATABASE_URL is set; otherwise an in-memory
// store with the same interface, so the site runs locally without a database.
import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import pg from 'pg';
import { COLLECTIONS, SETTINGS_FIELDS, camel, snake } from './collections.js';
import * as catalogue from './catalogue.js';
import { blogSeed } from './blog-seed.js';
import { NEW_MODEL_PAGES, defaultPlacements } from '../placements.js';

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
  await applyCatalogueOnce(rows[0].n === 0);
}

/* ---------------- shared catalogue (catalogue.json) ---------------- */

// Specifications that come from the DGB India catalogue. NASTOWN's own fields (summary,
// best-for, featured, rentable, page placement, floors, active) are never touched here.
const MODEL_SPEC_FIELDS = [
  'brand', 'bays', 'raid', 'expandable', 'network', 'networkUpgrade', 'cpu', 'cpuCores', 'memory', 'memoryMax',
  'm2Slots', 'maxDriveTb', 'baysWithExpansion', 'expansionNote', 'maxRawTb', 'usbPorts', 'dimensions', 'weightKg',
  'warranty', 'specsUrl', 'quotePrice',
];
const LINE_SPEC_FIELDS = ['brand', 'driveClass', 'madeForBrand', 'series', 'rpm', 'cache', 'interface', 'recording', 'workloadTbYear', 'mtbf', 'warrantyYears', 'bestFor', 'extras', 'specsUrl', 'sortOrder'];
const same = (a, b) => JSON.stringify(Array.isArray(a) ? a : a == null ? null : String(a)) === JSON.stringify(Array.isArray(b) ? b : b == null ? null : String(b));

/**
 * Bring the database in line with catalogue.json, once per version of that file (its
 * exportedAt). Later edits in the admin panel are therefore never overwritten on restart;
 * only a new catalogue file applies again. Every change is written to the change log.
 */
async function applyCatalogueOnce(freshlySeeded) {
  const version = catalogue.exportedAt;
  if (!version) return;
  const applied = (await pool.query("SELECT value FROM app_meta WHERE key = 'catalogue_version'")).rows[0]?.value;
  const remember = () => pool.query(
    "INSERT INTO app_meta (key, value) VALUES ('catalogue_version', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [version],
  );
  if (freshlySeeded) { await remember(); return; } // seeded from this very file
  if (applied === version) return;

  const editor = `catalogue sync (${version.slice(0, 10)})`;
  const log = [];
  const record = (collection, row, label, before, after, fields) => {
    for (const f of fields) if (!same(before[f], after[f])) log.push({ editor, collection, itemId: row.id, itemLabel: label, field: f, before: before[f] == null ? null : String(before[f]), after: after[f] == null ? null : String(after[f]) });
  };

  const models = await list('models');
  for (const src of catalogue.models) {
    const patch = Object.fromEntries(MODEL_SPEC_FIELDS.map((f) => [f, src[f] ?? null]));
    const row = models.find((m) => m.model === src.model);
    if (!row) {
      const created = await insertRow('models', { ...src, pages: [...NEW_MODEL_PAGES] });
      log.push({ editor, collection: 'models', itemId: created.id, itemLabel: src.model, field: '(created)', after: 'created' });
      continue;
    }
    const changed = MODEL_SPEC_FIELDS.filter((f) => !same(row[f], patch[f]));
    if (!changed.length) continue;
    const { before, after } = await update('models', row.id, Object.fromEntries(changed.map((f) => [f, patch[f]])));
    record('models', row, row.model, before, after, changed);
  }

  const drives = await list('drives');
  for (const src of catalogue.drives) {
    const row = drives.find((d) => d.capacityTb === src.capacityTb && d.line === src.line);
    const label = `${src.capacityTb} TB ${src.line}`;
    if (!row) {
      const created = await insertRow('drives', src);
      log.push({ editor, collection: 'drives', itemId: created.id, itemLabel: label, field: '(created)', after: String(src.quotePrice) });
    } else if (!same(row.quotePrice, src.quotePrice)) {
      const { before, after } = await update('drives', row.id, { quotePrice: src.quotePrice });
      record('drives', row, label, before, after, ['quotePrice']);
    }
  }

  const lines = await list('driveLines');
  for (const src of catalogue.driveLines) {
    const row = lines.find((l) => l.name === src.name);
    if (!row) {
      const created = await insertRow('driveLines', src);
      log.push({ editor, collection: 'driveLines', itemId: created.id, itemLabel: src.name, field: '(created)', after: 'created' });
      continue;
    }
    const changed = LINE_SPEC_FIELDS.filter((f) => !same(row[f], src[f] ?? null));
    if (!changed.length) continue;
    const { before, after } = await update('driveLines', row.id, Object.fromEntries(changed.map((f) => [f, src[f] ?? null])));
    record('driveLines', row, row.name, before, after, changed);
  }

  const s = await getSettings();
  const settingsPatch = Object.fromEntries(['installQuote', 'amcQuotePercent'].filter((f) => !same(s?.[f], catalogue.settings[f])).map((f) => [f, catalogue.settings[f]]));
  if (Object.keys(settingsPatch).length) {
    await updateSettings(settingsPatch);
    for (const [f, v] of Object.entries(settingsPatch)) log.push({ editor, collection: 'settings', itemLabel: 'Installation & AMC', field: f, before: String(s?.[f] ?? ''), after: String(v) });
  }

  await logChanges(log);
  await remember();
  console.log(`[db] applied catalogue ${version}: ${log.length} change(s)`);
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
// Append-only: entries are only ever added. There is no update or delete function, and in
// Postgres a trigger (schema.sql) refuses UPDATE / DELETE / TRUNCATE on the table.

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

/**
 * A page of the log, newest first. `before` = the oldest id already shown, to load older
 * entries; `collections` narrows to some areas (e.g. ['coupons']). Nothing is ever cut off:
 * paging walks back to the very first entry.
 */
export async function listChangeLog({ limit = 200, before = null, collections = null } = {}) {
  if (!pool) {
    return mem.changeLog
      .filter((e) => (before == null || e.id < before) && (!collections || collections.includes(e.collection)))
      .slice(0, limit);
  }
  const where = [];
  const params = [];
  if (before != null) { params.push(before); where.push(`id < $${params.length}`); }
  if (collections) { params.push(collections); where.push(`collection = ANY($${params.length})`); }
  params.push(limit);
  const { rows } = await pool.query(
    `SELECT * FROM nas_change_log ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id DESC LIMIT $${params.length}`,
    params,
  );
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

/** Remove a staff account; returns { email, role } of who was removed (for the change log), or null. */
export async function deleteUser(id) {
  if (!pool) {
    const u = mem.users.find((x) => x.id === id);
    mem.users = mem.users.filter((x) => x.id !== id);
    return u ? { email: u.email, role: u.role } : null;
  }
  const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email, role', [id]);
  return rows[0] ?? null;
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
 * Details (quote, message, phone…) are saved on first issue and kept up to date after:
 * a value left empty never wipes one given earlier.
 * Returns { code, valueInr, isNew }.
 */
export async function issueCoupon({ email, name, company, phone, valueInr, quoteTotal, quoteSummary, message, source }) {
  const key = email.toLowerCase();
  const details = { name, company, phone, quoteTotal, quoteSummary, message, source };
  if (!pool) {
    mem.coupons ??= [];
    const found = mem.coupons.find((c) => c.email.toLowerCase() === key);
    if (found) {
      for (const [k, v] of Object.entries(details)) if (v != null && v !== '') found[k] = v;
      found.updatedAt = new Date();
      return { code: found.code, valueInr: found.valueInr, isNew: false };
    }
    let code;
    do code = newCouponCode(); while (mem.coupons.some((c) => c.code === code));
    mem.coupons.push({ id: nextId('coupons'), code, email, valueInr, ...details, status: 'issued', createdAt: new Date(), updatedAt: new Date() });
    return { code, valueInr, isNew: true };
  }
  const values = [name, company, phone, quoteTotal, quoteSummary, message, source];
  const update = async () => {
    const { rows } = await pool.query(
      `UPDATE coupons SET name = COALESCE($2, name), company = COALESCE($3, company), phone = COALESCE($4, phone),
         quote_total = COALESCE($5, quote_total), quote_summary = COALESCE($6, quote_summary),
         message = COALESCE($7, message), source = COALESCE($8, source), updated_at = now()
       WHERE lower(email) = $1 RETURNING code, value_inr`,
      [key, ...values],
    );
    return rows[0] && { code: rows[0].code, valueInr: rows[0].value_inr, isNew: false };
  };
  const existing = await update();
  if (existing) return existing;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO coupons (code, email, value_inr, name, company, phone, quote_total, quote_summary, message, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING code, value_inr`,
        [newCouponCode(), email, valueInr, ...values],
      );
      return { code: rows[0].code, valueInr: rows[0].value_inr, isNew: true };
    } catch (e) {
      if (e.code !== '23505') throw e; // unique clash: the email raced us, or (rarely) the code exists
      const again = await update();
      if (again) return again;
    }
  }
  throw new Error('Could not issue a coupon code.');
}

const couponFromRow = (r) => r && Object.fromEntries(Object.entries(r).map(([k, v]) => [camel(k), v]));

/** Set a coupon's status. Returns { before, after } or null if it doesn't exist. */
export async function setCouponStatus(id, status) {
  if (!pool) {
    const c = (mem.coupons ?? []).find((x) => x.id === id);
    if (!c) return null;
    const before = structuredClone(c);
    Object.assign(c, { status, updatedAt: new Date() });
    return { before, after: structuredClone(c) };
  }
  const before = (await pool.query('SELECT * FROM coupons WHERE id = $1', [id])).rows[0];
  if (!before) return null;
  const { rows } = await pool.query('UPDATE coupons SET status = $2, updated_at = now() WHERE id = $1 RETURNING *', [id, status]);
  return { before: couponFromRow(before), after: couponFromRow(rows[0]) };
}

/** Remove a coupon and return what was removed (for the change log), or null. */
export async function deleteCoupon(id) {
  if (!pool) {
    const i = (mem.coupons ?? []).findIndex((x) => x.id === id);
    return i === -1 ? null : mem.coupons.splice(i, 1)[0];
  }
  const { rows } = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING *', [id]);
  return couponFromRow(rows[0]) ?? null;
}

/** Every issued coupon with its customer details, newest first (Admin → Coupons). */
export async function listCoupons(limit = 500) {
  if (!pool) return [...(mem.coupons ?? [])].reverse().slice(0, limit).map((c) => structuredClone(c));
  const { rows } = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC LIMIT $1', [limit]);
  return rows.map(couponFromRow);
}

/* ---------------- customer reviews ---------------- */

const REVIEW_FIELDS = ['name', 'email', 'city', 'product', 'rating', 'body', 'source', 'status'];
const rowObj = (r) => r && Object.fromEntries(Object.entries(r).map(([k, v]) => [camel(k), v]));

/** Reviews newest first. `publishedOnly` for the public site. */
export async function listReviews({ publishedOnly = false, limit = 500 } = {}) {
  if (!pool) {
    return [...(mem.reviews ?? [])].filter((r) => !publishedOnly || r.status === 'published')
      .sort((a, b) => b.createdAt - a.createdAt).slice(0, limit).map((r) => structuredClone(r));
  }
  const { rows } = await pool.query(
    `SELECT * FROM reviews ${publishedOnly ? "WHERE status = 'published'" : ''} ORDER BY created_at DESC LIMIT $1`, [limit],
  );
  return rows.map(rowObj);
}

export async function createReview(data) {
  const row = Object.fromEntries(REVIEW_FIELDS.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]));
  if (!pool) {
    mem.reviews ??= [];
    const r = { id: nextId('reviews'), email: null, city: null, product: null, source: 'website', status: 'pending', ...row, createdAt: new Date(), updatedAt: new Date() };
    mem.reviews.push(r);
    return structuredClone(r);
  }
  const keys = Object.keys(row);
  const { rows } = await pool.query(
    `INSERT INTO reviews (${keys.map(snake).join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
    keys.map((k) => row[k]),
  );
  return rowObj(rows[0]);
}

/** Update some fields. Returns { before, after } or null. */
export async function updateReview(id, data) {
  const patch = Object.fromEntries(REVIEW_FIELDS.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]));
  if (!pool) {
    const r = (mem.reviews ?? []).find((x) => x.id === id);
    if (!r) return null;
    const before = structuredClone(r);
    Object.assign(r, patch, { updatedAt: new Date() });
    return { before, after: structuredClone(r) };
  }
  const before = (await pool.query('SELECT * FROM reviews WHERE id = $1', [id])).rows[0];
  if (!before) return null;
  const keys = Object.keys(patch);
  if (!keys.length) return { before: rowObj(before), after: rowObj(before) };
  const { rows } = await pool.query(
    `UPDATE reviews SET ${keys.map((k, i) => `${snake(k)} = $${i + 2}`).join(', ')}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...keys.map((k) => patch[k])],
  );
  return { before: rowObj(before), after: rowObj(rows[0]) };
}

/** Remove a review and return it (for the change log), or null. */
export async function deleteReview(id) {
  if (!pool) {
    const i = (mem.reviews ?? []).findIndex((x) => x.id === id);
    return i === -1 ? null : mem.reviews.splice(i, 1)[0];
  }
  const { rows } = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);
  return rowObj(rows[0]) ?? null;
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
