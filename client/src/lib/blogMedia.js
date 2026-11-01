import { mediaUrl } from './api.js';

const FULL = mediaUrl('/api/');

export function withMediaHost(html = '') {
  return FULL === '/api/' ? html : html.replaceAll('src="/api/', `src="${FULL}`);
}

export function withoutMediaHost(html = '') {
  return FULL === '/api/' ? html : html.replaceAll(`src="${FULL}`, 'src="/api/');
}
