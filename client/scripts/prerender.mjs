// Last build step: puts each public page's content into its HTML file.
//
// Before this, every page was an empty <div id="root"> until JavaScript ran, so search engines
// that don't run scripts (Bing, most AI assistants, link previews) saw nothing. Now the page
// content, links and prices are in the HTML itself.
//
// Visitors with JavaScript see no change: an inline script in index.html hides the pre-rendered
// copy, React draws the page exactly as before and then shows it. Without JavaScript the
// pre-rendered copy is the page.
//
// Runs after `vite build` (pages list and per-page <head> from scripts/seo-plugin.mjs) and
// `vite build --ssr` (src/entry-prerender.jsx). Data comes from the live API, like the sitemap.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = path.join(root, '.prerender');
const manifest = path.join(work, 'pages.json');

let job;
try {
  job = JSON.parse(await fs.readFile(manifest, 'utf8'));
} catch {
  console.warn('[prerender] no page list (VITE_SITE_URL not set?): pages keep an empty body, as before.');
  process.exit(0);
}

const { render } = await import(pathToFileURL(path.join(work, 'ssr', 'entry-prerender.js')).href);
const api = (job.apiUrl || '').replace(/\/+$/, '');
const cache = new Map(); // API path -> response, shared by every page

async function fetchApi(p) {
  if (cache.has(p)) return cache.get(p);
  let data;
  try {
    const res = await fetch(`${api}/api${p}`, { signal: AbortSignal.timeout(15000) });
    data = res.ok ? await res.json() : undefined;
  } catch {
    data = undefined;
  }
  cache.set(p, data);
  return data;
}

/** Render, fetch whatever the page asked for, render again (pages that list then link need two rounds). */
async function renderPage(url) {
  for (let round = 0; round < 4; round++) {
    const data = {};
    for (const [k, v] of cache) if (v !== undefined) data[k] = v;
    const state = { data, missing: new Set() };
    globalThis.__NASTOWN_PRELOAD__ = state;
    const html = await render(url);
    const wanted = [...state.missing].filter((p) => !cache.has(p));
    if (!wanted.length || !api) return html;
    await Promise.all(wanted.map(fetchApi));
  }
  return render(url);
}

const EMPTY = '<div id="root"></div>';
let done = 0;
for (const page of job.pages) {
  const file = path.join(job.outDir, page.path === '/' ? 'index.html' : path.join(page.path, 'index.html'));
  const html = await fs.readFile(file, 'utf8');
  if (!html.includes(EMPTY)) continue;
  try {
    const body = await renderPage(page.path);
    await fs.writeFile(file, html.replace(EMPTY, () => `<div id="root" data-prerendered>${body}</div>`));
    done++;
  } catch (err) {
    console.warn(`[prerender] ${page.path}: ${err.message} (left as before)`);
  }
}
delete globalThis.__NASTOWN_PRELOAD__;
await fs.rm(work, { recursive: true, force: true });
console.log(`[prerender] ${done} of ${job.pages.length} pages have their content in the HTML`);
