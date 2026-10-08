// Data for pre-rendered pages (scripts/prerender.mjs).
//
// At build time every public page is rendered to HTML, so search engines, link previews and
// AI assistants read real content without running JavaScript. Effects don't run there, so the
// data hooks start from preloaded(path) instead of fetching: the build renders a page, notes
// which API paths it asked for, fetches them and renders again.
//
// In the browser nothing is preloaded: preloaded() returns undefined and every hook fetches
// exactly as before.

const store = () => globalThis.__NASTOWN_PRELOAD__;

/** The API response for `path` (e.g. "/products?page=products") if the build supplied it. */
export function preloaded(path) {
  const s = store();
  if (!s) return undefined;
  if (!(path in s.data)) s.missing.add(path);
  return s.data[path];
}

/** API path for a list of products, the same one api.products() requests. */
export const productsPath = (params = {}) => `/products?${new URLSearchParams(params)}`;
export const blogPath = (params = {}) => `/blog?${new URLSearchParams(params)}`;
