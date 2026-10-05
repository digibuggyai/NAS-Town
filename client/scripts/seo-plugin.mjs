// Vite plugin: puts each page's SEO tags into real HTML, so crawlers and link previews
// (Google's first pass, WhatsApp, LinkedIn, X…) see the right title, description and card
// without running JavaScript. The tags themselves come from src/lib/seo.js.
//
//   dev + build: index.html's <!-- seo --> placeholder gets the home page tags.
//   build only:  dist/<path>/index.html for every page (fixed pages, plus products and blog
//                posts fetched from the API), dist/sitemap.xml and dist/robots.txt.
import fs from 'node:fs/promises';
import path from 'node:path';
import { headHtml, postMeta, productMeta, staticPages, abs } from '../src/lib/seo.js';

const START = '<!-- seo:start -->';
const END = '<!-- seo:end -->';
const block = (meta, siteUrl) => `${START}\n    ${headHtml(meta, siteUrl)}\n    ${END}`;

/** Live address of the site: VITE_SITE_URL, else Vercel's production domain, else local. */
export function resolveSiteUrl(env) {
  const url = env.VITE_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) || '';
  return url.replace(/\/+$/, '');
}

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

export default function seoPlugin({ siteUrl, apiUrl }) {
  let outDir;
  let isBuild = false;
  return {
    name: 'nastown-seo',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
    },
    transformIndexHtml(html) {
      const site = siteUrl || 'http://localhost:5173';
      return html.replace('<!-- seo -->', block({ ...staticPages(site)['/'], path: '/' }, site));
    },
    async closeBundle() {
      if (!isBuild) return;
      if (!siteUrl) {
        this.warn('VITE_SITE_URL is not set: skipped per-page HTML, sitemap.xml and robots.txt. Set it to the live address, e.g. https://nastown.com');
        return;
      }
      const template = await fs.readFile(path.join(outDir, 'index.html'), 'utf8');
      const pages = Object.entries(staticPages(siteUrl)).map(([p, meta]) => ({ ...meta, path: p }));

      // Database pages. If the API can't be reached the build still succeeds: those pages
      // then get their tags in the browser only, and are left out of the sitemap.
      const api = (apiUrl || '').replace(/\/+$/, '');
      if (api) {
        const [products, posts] = await Promise.all([
          getJson(`${api}/api/products`).catch((e) => (this.warn(`products not fetched: ${e.message}`), [])),
          getJson(`${api}/api/blog?limit=50`).catch((e) => (this.warn(`blog posts not fetched: ${e.message}`), [])),
        ]);
        for (const p of products) pages.push({ ...productMeta(p, siteUrl), lastmod: p.updatedAt });
        for (const post of posts) {
          const cover = post.coverImage ? abs(post.coverImage.startsWith('/api/') ? `${api}${post.coverImage}` : post.coverImage, siteUrl) : '';
          pages.push({ ...postMeta(post, siteUrl, cover), lastmod: post.updatedAt || post.publishedAt });
        }
      } else {
        this.warn('VITE_API_URL is not set: product and blog pages not pre-rendered or listed in sitemap.xml.');
      }

      for (const page of pages) {
        const html = template.replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => block(page, siteUrl));
        const file = page.path === '/' ? path.join(outDir, 'index.html') : path.join(outDir, page.path, 'index.html');
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, html);
      }

      const urls = pages
        .filter((p) => !p.noindex)
        .map((p) => {
          const lastmod = p.lastmod ? `<lastmod>${String(p.lastmod).slice(0, 10)}</lastmod>` : '';
          return `  <url><loc>${abs(p.path, siteUrl)}</loc>${lastmod}</url>`;
        });
      await fs.writeFile(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      );
      await fs.writeFile(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      );
      console.log(`[seo] ${pages.length} pages pre-rendered, ${urls.length} in sitemap.xml (${siteUrl})`);
    },
  };
}
