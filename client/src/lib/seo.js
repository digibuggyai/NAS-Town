// SEO for every page, in one place: titles, descriptions, social cards and structured data.
// Used in two ways:
//   - in the browser, by <Seo /> (components/Seo.jsx), which updates <head> on each page;
//   - at build time, by scripts/seo-plugin.mjs, which writes each page's <head> into its own
//     HTML file so search engines and link previews (WhatsApp, LinkedIn…) see it without JavaScript.
// Keep this file plain JS with no browser-only or Vite-only code, so Node can import it.
import { brands, digibuggy, faqs, resources, services, solutions } from '../data/site.js';

export const SITE_NAME = 'NASTOWN';
export const DEFAULT_IMAGE = '/og-image.jpg'; // 1200×630 social card
const MAX_DESC = 158;

/** Trim to a search-snippet length, ending on a whole word. */
export function clip(text = '', max = MAX_DESC) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,;:.\s]+$/, '')}…`;
}

/** Absolute URL for a path or already-absolute link. */
export const abs = (url, siteUrl) => (!url ? url : /^https?:\/\//.test(url) ? url : `${siteUrl.replace(/\/+$/, '')}${url.startsWith('/') ? '' : '/'}${url}`);

const crumbs = (siteUrl, items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'], ...items].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path, siteUrl) })),
});

/** The business, on every page: who NASTOWN is and where the showroom is. */
export function siteJsonLd(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#org`,
        name: SITE_NAME,
        url: `${siteUrl}/`,
        logo: abs('/apple-touch-icon.png', siteUrl),
        email: digibuggy.email,
        telephone: '+91-93114-47394',
        parentOrganization: { '@type': 'Organization', name: 'Digibuggy', url: digibuggy.site, sameAs: digibuggy.socials.filter((s) => s.label !== 'WhatsApp').map((s) => s.href) },
      },
      {
        '@type': 'ComputerStore',
        '@id': `${siteUrl}/#store`,
        name: `${SITE_NAME} by Digibuggy`,
        url: `${siteUrl}/`,
        image: abs(DEFAULT_IMAGE, siteUrl),
        telephone: '+91-93114-47394',
        email: digibuggy.email,
        priceRange: '₹₹',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '207, Second Floor, Mansarovar Building, 90 Nehru Place',
          addressLocality: 'New Delhi',
          addressRegion: 'Delhi',
          postalCode: '110019',
          addressCountry: 'IN',
        },
        hasMap: digibuggy.mapsHref,
        parentOrganization: { '@id': `${siteUrl}/#org` },
      },
      { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: SITE_NAME, url: `${siteUrl}/`, publisher: { '@id': `${siteUrl}/#org` }, inLanguage: 'en-IN' },
    ],
  };
}

/* ---------------- fixed pages ---------------- */

/** Every page whose content lives in the code (not the database), keyed by path. */
export function staticPages(siteUrl) {
  const pages = {
    '/': {
      title: 'NAS Storage Solutions, Setup & Support | NASTOWN',
      description: 'Find, configure and buy the right NAS. Synology and QNAP systems with drives, installation, RAID setup and support from NASTOWN in Nehru Place, New Delhi.',
    },
    '/products': {
      title: 'NAS Products: Synology & QNAP NAS Prices | NASTOWN',
      description: 'Compare 2-bay to 8-bay and rackmount NAS from Synology and QNAP: RAID support, drive bays, RAM and network speeds, with GST-inclusive prices.',
      jsonLd: crumbs(siteUrl, [['NAS Products', '/products']]),
    },
    '/solutions': {
      title: 'NAS Solutions for Every Use Case | NASTOWN',
      description: 'NAS setups for photographers, videographers, creators, businesses, homes, surveillance and enterprise. See what each workflow needs and what we recommend.',
      jsonLd: crumbs(siteUrl, [['Solutions', '/solutions']]),
    },
    '/services': {
      title: 'NAS Services: Installation, Migration & Support | NASTOWN',
      description: 'NAS installation, data migration, RAID setup, upgrades, repair, data recovery, AMC plans and remote or on-site support from the NASTOWN team in New Delhi.',
      jsonLd: crumbs(siteUrl, [['Services', '/services']]),
    },
    '/rent': {
      title: 'Rent a NAS: Short-Term Storage on Flexible Terms | NASTOWN',
      description: 'Rent a NAS for a project, event, migration or trial. Configured before it reaches you, full performance, support included and no large upfront cost.',
    },
    '/tools/calculator': {
      title: 'NAS Storage & ROI Calculator | NASTOWN',
      description: 'Estimate how much NAS storage you need from your photos, video and backups, and compare the cost of a NAS against cloud storage over the years.',
    },
    '/tools/configurator': {
      title: 'NAS Configurator: Build & Price Your NAS | NASTOWN',
      description: 'Pick capacity, RAID level, bays and brand, and get the right NAS with drives, installation and AMC, priced instantly with GST.',
    },
    '/finder': {
      title: 'NAS Finder: Which NAS Do I Need? | NASTOWN',
      description: 'Answer a few simple questions about what you store and how you work, and get a NAS recommendation that fits.',
    },
    '/about': {
      title: 'About & Contact NASTOWN | NAS Experts in Nehru Place',
      description: "NASTOWN makes NAS storage simple, from choosing the right system to keeping it running. Backed by Digibuggy, Nehru Place, New Delhi. Let's talk storage.",
    },
    '/sitemap': {
      title: 'Sitemap | NASTOWN',
      description: 'Every page on NASTOWN: NAS products, solutions, brands, services, tools and resources.',
    },
    '/privacy': { title: 'Privacy Policy | NASTOWN', description: 'NASTOWN privacy policy.', noindex: true },
    '/terms': { title: 'Terms of Service | NASTOWN', description: 'NASTOWN terms of service.', noindex: true },
  };

  for (const s of solutions) {
    pages[`/solutions/${s.slug}`] = {
      title: `NAS for ${s.name}: Storage Built for You | NASTOWN`,
      description: clip(s.intro),
      jsonLd: crumbs(siteUrl, [['Solutions', '/solutions'], [`NAS for ${s.name}`, `/solutions/${s.slug}`]]),
    };
  }
  for (const b of brands) {
    const name = b.slug === 'other' ? 'Other NAS Brands' : `${b.name} NAS`;
    pages[`/brands/${b.slug}`] = {
      title: `${name}: Prices, Setup & Support | NASTOWN`,
      description: clip(b.intro),
      jsonLd: crumbs(siteUrl, [[name, `/brands/${b.slug}`]]),
    };
  }
  for (const s of services) {
    pages[`/services/${s.slug}`] = {
      title: `NAS ${s.name} | NASTOWN Services`,
      description: clip(s.price ? `${s.intro} ${s.price}.` : s.intro),
      jsonLd: [
        crumbs(siteUrl, [['Services', '/services'], [s.name, `/services/${s.slug}`]]),
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `NAS ${s.name}`,
          description: s.intro,
          serviceType: `NAS ${s.name}`,
          provider: { '@id': `${siteUrl}/#store` },
          areaServed: { '@type': 'Country', name: 'India' },
          url: abs(`/services/${s.slug}`, siteUrl),
        },
      ],
    };
  }
  for (const r of resources) {
    const page = {
      title: r.slug === 'blog' ? 'NAS Blog: Tips, Guides & News | NASTOWN' : `${r.name} | NASTOWN`,
      description: clip(r.intro),
      jsonLd: [crumbs(siteUrl, [['Resources', '/resources/guides'], [r.name, `/resources/${r.slug}`]])],
    };
    if (r.slug === 'faq') {
      page.title = 'NAS FAQ: Common Questions Answered | NASTOWN';
      page.jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      });
    }
    pages[`/resources/${r.slug}`] = page;
  }
  return pages;
}

/* ---------------- database pages ---------------- */

const BRAND = { synology: 'Synology', qnap: 'QNAP', asustor: 'Asustor' };

export function productMeta(p, siteUrl) {
  const brand = BRAND[p.brand] ?? p.brand;
  const price = p.price_inr != null ? `₹${Number(p.price_inr).toLocaleString('en-IN')} diskless, GST incl.` : '';
  const path = `/products/${p.slug}`;
  return {
    title: `${p.model} ${p.bays}-Bay NAS: Price & Specs | NASTOWN`,
    description: clip([p.summary, [p.cpu, p.memory?.replace(/\s*\(.*?\)/g, ''), p.network].filter(Boolean).join(', ') + '.', price, 'Configure with drives and installation.'].filter(Boolean).join(' ')),
    path,
    jsonLd: [
      crumbs(siteUrl, [['NAS Products', '/products'], [p.model, path]]),
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.model,
        sku: p.slug,
        description: p.summary,
        brand: { '@type': 'Brand', name: brand },
        category: 'Network Attached Storage',
        image: abs(DEFAULT_IMAGE, siteUrl),
        url: abs(path, siteUrl),
        ...(p.price_inr != null && {
          offers: { '@type': 'Offer', price: p.price_inr, priceCurrency: 'INR', url: abs(path, siteUrl), seller: { '@id': `${siteUrl}/#store` } },
        }),
      },
    ],
  };
}

/** `cover` is the post's cover image as an absolute URL, or empty. */
export function postMeta(post, siteUrl, cover) {
  const path = `/blog/${post.slug}`;
  return {
    title: `${post.title} | NASTOWN Blog`,
    description: clip(post.excerpt || post.title),
    path,
    type: 'article',
    image: cover || undefined,
    jsonLd: [
      crumbs(siteUrl, [['Blog', '/resources/blog'], [post.title, path]]),
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || undefined,
        image: cover || abs(DEFAULT_IMAGE, siteUrl),
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        articleSection: post.category || undefined,
        author: { '@id': `${siteUrl}/#org` },
        publisher: { '@id': `${siteUrl}/#org` },
        mainEntityOfPage: abs(path, siteUrl),
      },
    ],
  };
}

/* ---------------- rendering ---------------- */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// JSON inside <script>: stop "</script>" in content from closing the tag early.
export const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

/** Resolve a page's meta into the exact values written to <head>. */
export function headValues(meta, siteUrl) {
  const url = meta.noindex ? null : abs(meta.path ?? '/', siteUrl);
  return {
    title: meta.title,
    description: meta.description,
    canonical: url,
    robots: meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    type: meta.type ?? 'website',
    image: abs(meta.image || DEFAULT_IMAGE, siteUrl),
    url: url ?? abs(meta.path ?? '/', siteUrl),
    jsonLd: meta.jsonLd ? [meta.jsonLd].flat() : [],
  };
}

/** The managed <head> tags as HTML, for the build. Same tags <Seo /> updates in the browser. */
export function headHtml(meta, siteUrl) {
  const v = headValues(meta, siteUrl);
  return [
    `<title>${esc(v.title)}</title>`,
    `<meta name="description" content="${esc(v.description)}" />`,
    `<meta name="robots" content="${v.robots}" />`,
    v.canonical && `<link rel="canonical" href="${esc(v.canonical)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:type" content="${v.type}" />`,
    `<meta property="og:title" content="${esc(v.title)}" />`,
    `<meta property="og:description" content="${esc(v.description)}" />`,
    `<meta property="og:url" content="${esc(v.url)}" />`,
    `<meta property="og:image" content="${esc(v.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(v.title)}" />`,
    `<meta name="twitter:description" content="${esc(v.description)}" />`,
    `<meta name="twitter:image" content="${esc(v.image)}" />`,
    `<script type="application/ld+json" id="ld-site">${jsonForScript(siteJsonLd(siteUrl))}</script>`,
    v.jsonLd.length > 0 && `<script type="application/ld+json" id="ld-page">${jsonForScript(v.jsonLd.length === 1 ? v.jsonLd[0] : v.jsonLd)}</script>`,
  ].filter(Boolean).join('\n    ');
}
