// Data access layer. Uses PostgreSQL when DATABASE_URL is set; otherwise falls back
// to an in-memory store so the site runs locally without a database.
import fs from 'node:fs/promises';
import pg from 'pg';
import { products as seedProducts } from './seed.js';

const url = process.env.DATABASE_URL;
const pool = url
  ? new pg.Pool({
      connectionString: url,
      ssl: /localhost|127\.0\.0\.1|\.railway\.internal/.test(url) ? false : { rejectUnauthorized: false },
    })
  : null;

const memory = { products: seedProducts.map((p, i) => ({ id: i + 1, ...p })), enquiries: [], finder: [] };

export const usingDatabase = Boolean(pool);

export async function init() {
  if (!pool) {
    console.warn('[db] DATABASE_URL not set; using the in-memory store (data resets on restart).');
    return;
  }
  const schema = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await pool.query(schema);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products');
  if (rows[0].n === 0) {
    for (const p of seedProducts) {
      await pool.query(
        `INSERT INTO products (slug, brand, model, bays, cpu, memory, network, key_spec, segment,
           use_cases, max_raw_tb, price_inr, featured, rentable, summary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [p.slug, p.brand, p.model, p.bays, p.cpu, p.memory, p.network, p.key_spec, p.segment,
         p.use_cases, p.max_raw_tb, p.price_inr, p.featured, p.rentable, p.summary],
      );
    }
    console.log(`[db] seeded ${seedProducts.length} products`);
  }
}

export async function listProducts({ brand, featured, rentable } = {}) {
  if (!pool) {
    return memory.products.filter(
      (p) => (!brand || p.brand === brand) && (!featured || p.featured) && (!rentable || p.rentable),
    );
  }
  const where = [];
  const params = [];
  if (brand) { params.push(brand); where.push(`brand = $${params.length}`); }
  if (featured) where.push('featured');
  if (rentable) where.push('rentable');
  const sql = `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY bays, price_inr`;
  return (await pool.query(sql, params)).rows;
}

export async function getProduct(slug) {
  if (!pool) return memory.products.find((p) => p.slug === slug) ?? null;
  return (await pool.query('SELECT * FROM products WHERE slug = $1', [slug])).rows[0] ?? null;
}

export async function createEnquiry({ type, name, email, phone, message, payload }) {
  if (!pool) {
    const row = { id: memory.enquiries.length + 1, type, name, email, phone, message, payload, status: 'new', created_at: new Date() };
    memory.enquiries.push(row);
    return row;
  }
  const { rows } = await pool.query(
    `INSERT INTO enquiries (type, name, email, phone, message, payload)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, type, created_at`,
    [type, name, email, phone, message, payload ?? {}],
  );
  return rows[0];
}

export async function logFinder({ storing, capacity, work_style, recommended }) {
  if (!pool) {
    memory.finder.push({ storing, capacity, work_style, recommended, created_at: new Date() });
    return;
  }
  await pool.query(
    'INSERT INTO finder_submissions (storing, capacity, work_style, recommended) VALUES ($1,$2,$3,$4)',
    [storing, capacity, work_style, recommended],
  );
}
