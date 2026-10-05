import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { headValues, jsonForScript, staticPages } from '../lib/seo.js';

// Live site address for canonical links (set in vite.config.js); falls back to wherever the site is open.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '');

function setTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector);
  if (value == null) return el?.remove();
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}
function newMeta(key, name) {
  const m = document.createElement('meta');
  m.setAttribute(key, name);
  return m;
}
const setMeta = (key, name, value) => setTag(`meta[${key}="${name}"]`, () => newMeta(key, name), 'content', value);

/**
 * Page title, description, canonical link, social card and structured data.
 * With no props it uses the fixed copy for the current path (lib/seo.js);
 * pages built from the database pass their own `title`, `description`, `jsonLd`…
 * The build writes the same tags into each page's HTML (scripts/seo-plugin.mjs); this keeps them right as people navigate.
 */
export default function Seo(props) {
  const { pathname } = useLocation();
  const page = props.title ? props : staticPages(SITE_URL)[pathname.replace(/\/+$/, '') || '/'] ?? {};
  const v = headValues({ path: pathname, ...page }, SITE_URL);
  const ld = v.jsonLd.length ? jsonForScript(v.jsonLd.length === 1 ? v.jsonLd[0] : v.jsonLd) : null;

  useEffect(() => {
    if (v.title) document.title = v.title;
    setMeta('name', 'description', v.description);
    setMeta('name', 'robots', v.robots);
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', v.canonical);
    setMeta('property', 'og:type', v.type);
    setMeta('property', 'og:title', v.title);
    setMeta('property', 'og:description', v.description);
    setMeta('property', 'og:url', v.url);
    setMeta('property', 'og:image', v.image);
    setMeta('name', 'twitter:title', v.title);
    setMeta('name', 'twitter:description', v.description);
    setMeta('name', 'twitter:image', v.image);
    let script = document.getElementById('ld-page');
    if (!ld) script?.remove();
    else {
      if (!script) {
        script = Object.assign(document.createElement('script'), { type: 'application/ld+json', id: 'ld-page' });
        document.head.appendChild(script);
      }
      script.textContent = ld;
    }
  }, [v.title, v.description, v.robots, v.canonical, v.type, v.url, v.image, ld]);

  return null;
}
