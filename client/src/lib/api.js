const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export const api = {
  products: (params = {}) => request(`/products?${new URLSearchParams(params)}`),
  product: (slug) => request(`/products/${encodeURIComponent(slug)}`),
  finder: (answers) => request('/finder', { method: 'POST', body: JSON.stringify(answers) }),
  enquire: (body) => request('/enquiries', { method: 'POST', body: JSON.stringify(body) }),
};

export const formatInr = (n) =>
  n == null ? 'Price on request' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
