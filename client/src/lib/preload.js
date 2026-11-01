const store = () => globalThis.__NASTOWN_PRELOAD__;

export function preloaded(path) {
  const s = store();
  if (!s) return undefined;
  if (!(path in s.data)) s.missing.add(path);
  return s.data[path];
}

export const productsPath = (params = {}) => `/products?${new URLSearchParams(params)}`;
export const blogPath = (params = {}) => `/blog?${new URLSearchParams(params)}`;
