import 'dotenv/config';
import fs from 'node:fs';

const API = (process.env.PROD_API_URL || 'https://nas-town-production.up.railway.app').replace(/\/+$/, '') + '/api';
const apply = process.argv[2] === 'apply';
const floors = JSON.parse(fs.readFileSync(new URL('../src/db/floors.local.json', import.meta.url), 'utf8'));

const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
});
if (!login.ok) throw new Error(`Sign-in failed: ${login.status} ${await login.text()}`);
const { token, user } = await login.json();
console.log(`signed in as ${user.email} (${user.role})`);
const auth = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };

const cat = await (await fetch(`${API}/admin/nas`, { headers: auth })).json();
const changes = [];
for (const m of cat.models) {
  const f = floors.models?.[m.model];
  if (f != null && f !== m.minPrice) changes.push(['models', m.id, m.model, m.minPrice, f]);
}
for (const d of cat.drives) {
  const f = floors.drives?.[`${d.capacityTb}|${d.line}`];
  if (d.active && f != null && f !== d.minPrice) changes.push(['drives', d.id, `${d.capacityTb} TB ${d.line}`, d.minPrice, f]);
}
for (const u of cat.upgrades ?? []) {
  const f = floors.upgrades?.[u.sku];
  if (f != null && f !== u.minPrice) changes.push(['upgrades', u.id, u.sku, u.minPrice, f]);
}
const settings = Object.fromEntries(Object.entries(floors.settings ?? {}).filter(([k, v]) => cat.settings?.[k] !== v));

for (const [col, , label, before, after] of changes) console.log(`${col.padEnd(8)} ${label.padEnd(24)} ${before ?? 'none'} → ${after}`);
if (Object.keys(settings).length) console.log('settings', JSON.stringify(settings));
const missing = cat.drives.filter((d) => d.active && floors.drives?.[`${d.capacityTb}|${d.line}`] == null).map((d) => `${d.capacityTb} TB ${d.line}`);
if (missing.length) console.log(`no floor in floors.local.json: ${missing.join(', ')}`);
console.log(`${changes.length} floor(s) to change${apply ? '' : ' (dry run: add "apply" to save)'}`);
if (!apply) process.exit(0);

let ok = 0;
for (const [col, id, label, , after] of changes) {
  const r = await fetch(`${API}/admin/nas/${col}/${id}`, { method: 'PATCH', headers: auth, body: JSON.stringify({ minPrice: after }) });
  if (r.ok) ok += 1; else console.log(`failed ${label}: ${r.status} ${await r.text()}`);
}
if (Object.keys(settings).length) {
  const r = await fetch(`${API}/admin/nas/settings`, { method: 'PATCH', headers: auth, body: JSON.stringify(settings) });
  console.log(`settings ${r.status}`);
}
console.log(`updated ${ok} of ${changes.length}`);
