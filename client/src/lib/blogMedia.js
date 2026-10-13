// Images inside blog articles. Uploads live on the API ("/api/blog/images/12"), which in
// production is another host (Vercel site, Railway API). Articles store the short "/api/…"
// path, so they keep working if the API's address changes; the full address is put in only
// for showing them (the editor and the public post page).
import { mediaUrl } from './api.js';

const FULL = mediaUrl('/api/'); // "https://<api host>/api/" in production, "/api/" in development

/** Stored article HTML → HTML whose images load from the API host. */
export function withMediaHost(html = '') {
  return FULL === '/api/' ? html : html.replaceAll('src="/api/', `src="${FULL}`);
}

/** Editor HTML → HTML to store: image addresses back to the short "/api/…" form. */
export function withoutMediaHost(html = '') {
  return FULL === '/api/' ? html : html.replaceAll(`src="${FULL}`, 'src="/api/');
}
