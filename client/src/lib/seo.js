// SEO for every page, in one place: titles, descriptions, social cards and structured data.
// Used in two ways:
//   - in the browser, by <Seo /> (components/Seo.jsx), which updates <head> on each page;
//   - at build time, by scripts/seo-plugin.mjs, which writes each page's <head> into its own
//     HTML file so search engines and link previews (WhatsApp, LinkedIn…) see it without JavaScript.
// Keep this file plain JS with no browser-only or Vite-only code, so Node can import it.
import { brands, capacityPages, digibuggy, faqs, resources, services, solutions } from '../data/site.js';

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
        telephone: digibuggy.whatsapp.replace(/ /g, '-'),
        parentOrganization: { '@type': 'Organization', name: 'Digibuggy', url: digibuggy.site, sameAs: digibuggy.socials.filter((s) => s.label !== 'WhatsApp').map((s) => s.href) },
      },
      {
        '@type': 'ComputerStore',
        '@id': `${siteUrl}/#store`,
        name: `${SITE_NAME} by Digibuggy`,
        url: `${siteUrl}/`,
        image: abs(DEFAULT_IMAGE, siteUrl),
        telephone: digibuggy.whatsapp.replace(/ /g, '-'),
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
    const name = `${b.name} NAS`;
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
    // Guides, comparisons, reviews and how-tos are "coming soon" lists for now. Thin pages like
    // that drag the whole site down in Google, so they stay out of search until they have articles.
    if (r.upcoming) page.noindex = true;
    pages[`/resources/${r.slug}`] = page;
  }

  // "nas for 50tb", "50tb nas", "50tb nas storage", "50tb nas price", "50tb nas setup"
  pages['/nas'] = {
    title: 'NAS Storage by Capacity: 5TB to 100TB NAS Price | NASTOWN',
    description: 'How much NAS storage do you need? Compare 5TB, 10TB, 20TB, 50TB and 100TB NAS builds with drives, RAID and GST-inclusive prices in India.',
    jsonLd: crumbs(siteUrl, [['NAS by Capacity', '/nas']]),
  };
  for (const { tb } of capacityPages) {
    pages[`/nas/${tb}tb`] = {
      title: `${tb}TB NAS Storage: Price & Setup in India | NASTOWN`,
      description: `Need a NAS for ${tb}TB of data? Compare ${tb}TB NAS builds from Synology and QNAP with drives, RAID 5 or RAID 6, setup and GST-inclusive prices.`,
      jsonLd: crumbs(siteUrl, [['NAS by Capacity', '/nas'], [`${tb}TB NAS`, `/nas/${tb}tb`]]),
    };
  }

  for (const [path, copy] of Object.entries(KEYWORDS)) Object.assign(pages[path], copy);
  return pages;
}

/**
 * What each page is written to rank for: the search a buyer actually types (in the comment),
 * worked into the title (≈60 characters show) and the description (≈155 characters show).
 * One main search per page, so pages don't compete with each other.
 */
const KEYWORDS = {
  // "nas", "nas storage", "nas server", "network attached storage", "nas system", "nas storage device", "nas storage india"
  '/': {
    title: 'NAS Storage & NAS Servers in India | NASTOWN',
    description: 'Buy network attached storage (NAS) in India: Synology and QNAP NAS systems with drives, GST-inclusive prices, installation and support in Delhi.',
  },
  // "nas price india", "nas server price india"
  '/products': {
    title: 'NAS Price in India: NAS Server & Storage Price List | NASTOWN',
    description: 'NAS and NAS server prices in India: 2-bay to 8-bay and rackmount Synology and QNAP NAS with specs and GST-inclusive prices. Configure yours with drives.',
  },
  // "nas solutions", "which nas for"
  '/solutions': {
    title: 'NAS Solutions for Home, Business & Creators | NASTOWN',
    description: 'The right NAS for photographers, video editors, creators, small businesses, homes, CCTV and enterprise, with recommended models and drive setups for each.',
  },
  // "best nas for photographers india"
  '/solutions/photographers': {
    title: 'Best NAS for Photographers in India | NASTOWN',
    description: 'NAS storage for photographers: a RAID-protected RAW archive, automatic backup from cards and laptops, Lightroom-friendly, with remote client galleries.',
  },
  // "nas for video editing"
  '/solutions/videographers': {
    title: 'Best NAS for Video Editing in India | NASTOWN',
    description: 'Edit 4K and 8K footage straight off a NAS with 2.5GbE or 10GbE and NVMe cache. Shared projects for editing teams and a safe archive for finished work.',
  },
  // "nas for content creators", "nas for youtubers"
  '/solutions/creators': {
    title: 'NAS for Content Creators & YouTubers | NASTOWN',
    description: 'One NAS for your footage, design files, client assets and backups. Synced across devices, protected by RAID, reachable from anywhere. Built for creators.',
  },
  // "best nas for business", "nas for small business"
  '/solutions/business': {
    title: 'Best NAS for Business in India: Office File Server | NASTOWN',
    description: 'A business NAS gives your office one secure file server with user permissions, automatic backups and remote access. Set up and supported by our team.',
  },
  // "best nas for home", "best home nas india"
  '/solutions/home': {
    title: 'Best NAS for Home in India: Private Cloud & Backup | NASTOWN',
    description: 'Replace cloud subscriptions with your own home NAS: back up every phone and laptop, keep family photos safe and stream your media to any screen.',
  },
  // "nas for cctv", "surveillance nas"
  '/solutions/surveillance': {
    title: 'NAS for CCTV & Surveillance Recording | NASTOWN',
    description: 'Surveillance NAS for 24/7 CCTV recording: surveillance-grade drives, multiple camera streams and footage kept safe and searchable.',
  },
  // "enterprise nas storage"
  '/solutions/enterprise': {
    title: 'Enterprise NAS Storage Solutions in India | NASTOWN',
    description: 'Enterprise NAS with high availability, expansion units, iSCSI and virtualisation support, plus dedicated support and AMC for critical workloads.',
  },
  // "synology nas price in india", "synology dealer delhi"
  '/brands/synology': {
    title: 'Synology NAS Price in India | Authorized Dealer | NASTOWN',
    description: 'Buy genuine Synology NAS in India from an authorized dealer. DS225+, DS425+, DS925+ and more with GST-inclusive prices, installation and support in Delhi.',
  },
  // "qnap nas price in india", "qnap dealer delhi"
  '/brands/qnap': {
    title: 'QNAP NAS Price in India | Authorized Dealer | NASTOWN',
    description: 'Buy genuine QNAP NAS in India from an authorized dealer. 2-bay to 8-bay QNAP models with GST-inclusive prices, installation and support in Delhi.',
  },
  // "asustor nas india", "asustor nas price"
  '/brands/asustor': {
    title: 'Asustor NAS Price in India | NASTOWN',
    description: 'Asustor NAS in India with the easy ADM operating system: compare it with Synology and QNAP on features and price, and get it configured and installed by our team in Delhi.',
  },
  // "nas on rent", "rent nas delhi"
  '/rent': {
    title: 'NAS on Rent in Delhi: Short-Term Storage Rental | NASTOWN',
    description: 'Rent a NAS for a shoot, event, data migration or trial. Configured before delivery, full performance, support included and no big upfront cost.',
  },
  // "nas service", "nas installation", "nas support delhi"
  '/services': {
    title: 'NAS Service in Delhi: Installation, Repair & AMC | NASTOWN',
    description: 'NAS installation, data migration, RAID setup, upgrades, repair, data recovery and AMC for Synology and QNAP, remote or on-site, from our Delhi team.',
  },
  '/services/installation': {
    title: 'NAS Installation & Setup Service in Delhi | NASTOWN',
    description: 'Professional NAS installation for Synology and QNAP: drives, storage pools, users, shared folders, remote access and alerts, set up right from day one.',
  },
  '/services/migration': {
    title: 'NAS Data Migration Service | NASTOWN',
    description: 'Move to a new NAS without losing a file. Planned migration with folder structure and permissions preserved, checksummed transfers and minimal downtime.',
  },
  '/services/repair': {
    title: 'NAS Repair Service: Synology & QNAP | NASTOWN',
    description: 'NAS not booting, a failed drive or a degraded RAID? We diagnose and repair Synology and QNAP NAS fast, with your data safety first.',
  },
  '/services/upgrade': {
    title: 'NAS Upgrade: RAM, SSD Cache & 10GbE | NASTOWN',
    description: 'Get more from your current NAS: bigger drives, RAM and NVMe SSD cache upgrades, 2.5GbE or 10GbE networking and performance tuning.',
  },
  '/services/raid-setup': {
    title: 'NAS RAID Setup: RAID 1, 5, 6, 10 & SHR | NASTOWN',
    description: 'Get the right RAID level for your NAS. We recommend and build RAID 1, 5, 6, 10 or SHR for your workload, verify the array and set up alerts and hot spares.',
  },
  '/services/amc': {
    title: 'NAS AMC: Annual Maintenance Contract | NASTOWN',
    description: 'NAS AMC plans with scheduled health checks, firmware and security updates, backup verification and priority support for Synology and QNAP.',
  },
  '/services/remote-support': {
    title: 'NAS Remote Support from ₹2,000 | NASTOWN',
    description: 'Fix NAS software, sharing, remote access and backup problems remotely with our support team. Remote NAS support starts from ₹2,000 + tax.',
  },
  '/services/on-site-support': {
    title: 'On-Site NAS Support from ₹5,000 | NASTOWN',
    description: 'A NAS technician at your home or office for hardware failures, complex installs, rack mounting and network setup. On-site support from ₹5,000 + tax.',
  },
  '/services/data-recovery': {
    title: 'NAS Data Recovery: Synology, QNAP & RAID | NASTOWN',
    description: 'Recover data from a crashed NAS volume, failed drives, a broken RAID or accidental deletion, with a clear assessment before any work begins.',
  },
  // "nas storage calculator", "nas vs cloud cost"
  '/tools/calculator': {
    title: 'NAS Storage Calculator & NAS vs Cloud Cost | NASTOWN',
    description: 'How much NAS storage do you need? Estimate it from your photos, video and backups, and see when a NAS pays for itself compared with cloud storage.',
  },
  // "nas configuration", "nas setup price"
  '/tools/configurator': {
    title: 'NAS Configuration & Setup Price, with Drives | NASTOWN',
    description: 'Configure your NAS: choose capacity, RAID, bays and brand, and get the full setup price with hard drives, installation and AMC, instantly with GST.',
  },
  // "best nas", "which nas should i buy"
  '/finder': {
    title: 'Best NAS for You? Free NAS Finder: Which NAS to Buy | NASTOWN',
    description: 'Not sure which NAS to buy? Answer a few questions about what you store and how you work, and get a NAS recommendation that fits your needs and budget.',
  },
  // "nas dealer nehru place", "nastown contact"
  '/about': {
    title: 'NAS Dealer in Nehru Place, Delhi: About & Contact | NASTOWN',
    description: `NASTOWN by Digibuggy: NAS sales, setup and support from our showroom in Nehru Place, New Delhi. Call or WhatsApp ${digibuggy.whatsapp}.`,
  },
  // "what is nas", "nas faq"
  '/resources/faq': {
    title: 'What Is a NAS? NAS FAQ & Common Questions | NASTOWN',
    description: 'What is a NAS, how is it different from an external drive, is RAID a backup and how much storage do you need? Clear answers to common NAS questions.',
  },
  '/resources/blog': {
    title: 'NAS Blog: Buying Guides, Tips & News | NASTOWN',
    description: 'NAS buying guides, storage tips and practical advice for photographers, creators, homes and businesses in India.',
  },
};

/* ---------------- database pages ---------------- */

const BRAND = { synology: 'Synology', qnap: 'QNAP', asustor: 'Asustor' };

export function productMeta(p, siteUrl) {
  const brand = BRAND[p.brand] ?? p.brand;
  const price = p.price_inr != null ? `₹${Number(p.price_inr).toLocaleString('en-IN')} diskless, GST incl.` : '';
  const path = `/products/${p.slug}`;
  return {
    // People search a model plus "price": "ds925+ price in india".
    title: `${p.model} Price in India & Specs (${p.bays}-Bay NAS) | NASTOWN`,
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
          // Prices on the site include GST. No `availability`: stock isn't tracked, so it isn't claimed.
          offers: {
            '@type': 'Offer',
            price: p.price_inr,
            priceCurrency: 'INR',
            priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price_inr, priceCurrency: 'INR', valueAddedTaxIncluded: true },
            url: abs(path, siteUrl),
            seller: { '@id': `${siteUrl}/#store` },
          },
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
