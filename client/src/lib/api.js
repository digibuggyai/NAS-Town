const BASE = import.meta.env.VITE_API_URL ?? '';
const TOKEN_KEY = 'nastown.staff';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
}

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function request(path, { auth = false, ...options } = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && auth) setToken(null);
  if (!res.ok) throw new ApiError(data.error || 'Something went wrong. Please try again.', res.status);
  return data;
}

const body = (method, data) => ({ method, body: JSON.stringify(data) });

export const api = {
  products: (params = {}) => request(`/products?${new URLSearchParams(params)}`),
  product: (slug) => request(`/products/${encodeURIComponent(slug)}`),
  nasPricing: () => request('/nas-pricing'),
  logFinder: (data) => request('/finder', body('POST', data)),
  enquire: (data) => request('/enquiries', body('POST', data)),

  login: (email, password) => request('/auth/login', body('POST', { email, password })),
  me: () => request('/auth/me', { auth: true }),

  salesPricing: () => request('/admin/nas/pricing', { auth: true }),
  catalogue: () => request('/admin/nas', { auth: true }),
  createItem: (collection, data) => request(`/admin/nas/${collection}`, { auth: true, ...body('POST', data) }),
  updateItem: (collection, id, data) => request(`/admin/nas/${collection}/${id}`, { auth: true, ...body('PATCH', data) }),
  deleteItem: (collection, id) => request(`/admin/nas/${collection}/${id}`, { auth: true, method: 'DELETE' }),
  updateSettings: (data) => request('/admin/nas/settings', { auth: true, ...body('PATCH', data) }),
  changeLog: () => request('/admin/change-log', { auth: true }),
  users: () => request('/admin/users', { auth: true }),
  createUser: (data) => request('/admin/users', { auth: true, ...body('POST', data) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { auth: true, method: 'DELETE' }),
  enquiries: () => request('/admin/enquiries', { auth: true }),

  blog: (params = {}) => request(`/blog?${new URLSearchParams(params)}`),
  blogPost: (slug) => request(`/blog/${encodeURIComponent(slug)}`),
  adminPosts: () => request('/admin/blog', { auth: true }),
  createPost: (data) => request('/admin/blog', { auth: true, ...body('POST', data) }),
  updatePost: (id, data) => request(`/admin/blog/${id}`, { auth: true, ...body('PATCH', data) }),
  deletePost: (id) => request(`/admin/blog/${id}`, { auth: true, method: 'DELETE' }),

  /** Uploads a cover image as raw bytes; returns { url }. */
  async uploadBlogImage(file) {
    const res = await fetch(`${BASE}/api/admin/blog/images`, {
      method: 'POST',
      headers: { 'Content-Type': file.type, Authorization: `Bearer ${getToken()}` },
      body: file,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.error || 'Upload failed.', res.status);
    return data;
  },

  /** Downloads the internal price sheet (needs the auth header, so not a plain link). */
  async downloadPriceSheet() {
    const res = await fetch(`${BASE}/api/admin/price-sheet.csv`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) throw new ApiError('Could not download the price sheet.', res.status);
    const blob = await res.blob();
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] ?? 'price-sheet.csv',
    });
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

/** Uploaded images are served by the API, which may be on another host (Vercel + Railway). */
export const mediaUrl = (u) => (u && u.startsWith('/api/') ? `${BASE}${u}` : u);

export const formatPostDate = (iso) =>
  iso ? new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** Post body: blank line = paragraph; a line starting "## " = subheading. */
export const bodyBlocks = (body = '') =>
  String(body).split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

export const formatInr = (n) =>
  n == null ? 'Price on request' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
