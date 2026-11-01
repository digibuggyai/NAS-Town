import sanitize from 'sanitize-html';

const OWN_IMAGE = /^(\/api\/blog\/images\/\d+|\/images\/[\w./-]+)$/;
const ANCHOR_ID = /^[a-z0-9][a-z0-9-]{0,59}$/;

const OPTIONS = {
  allowedTags: [
    'p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'hr', 'code', 'pre',
    'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'mark', 'sub', 'sup',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'], ol: ['start'], img: ['src', 'alt', 'title'],
    th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'],
    p: ['id'], h2: ['id'], h3: ['id'], h4: ['id'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    h1: 'h2',
    h5: 'h4',
    h6: 'h4',
    b: 'strong',
    i: 'em',
    strike: 's',
    del: 's',
    img: (tag, attribs) => {
      const src = String(attribs.src ?? '').replace(/^https?:\/\/[^/]+(?=\/api\/blog\/images\/)/, '');
      return OWN_IMAGE.test(src)
        ? { tagName: 'img', attribs: { src, alt: String(attribs.alt ?? '').slice(0, 300), ...(attribs.title ? { title: String(attribs.title).slice(0, 300) } : {}) } }
        : { tagName: 'img', attribs: {} };
    },
    ...Object.fromEntries(['p', 'h2', 'h3', 'h4'].map((t) => [t, (tag, attribs) => ({ tagName: tag, attribs: ANCHOR_ID.test(attribs.id ?? '') ? { id: attribs.id } : {} })])),
    th: (tag, attribs) => ({ tagName: 'th', attribs: span(attribs) }),
    td: (tag, attribs) => ({ tagName: 'td', attribs: span(attribs) }),
    a: (tag, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? '');
      return { tagName: 'a', attribs: external ? { href: attribs.href, target: '_blank', rel: 'noopener noreferrer' } : { href: attribs.href } };
    },
  },
  exclusiveFilter: (frame) =>
    (frame.tag === 'img' && !frame.attribs.src) ||
    (['p', 'h2', 'h3', 'h4', 'li', 'blockquote'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren?.length),
};

function span(attribs) {
  const out = {};
  for (const k of ['colspan', 'rowspan']) {
    const n = Number(attribs[k]);
    if (Number.isInteger(n) && n > 1 && n <= 20) out[k] = String(n);
  }
  return out;
}

export const isHtml = (body = '') => /^\s*</.test(body);

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function legacyToHtml(body = '') {
  return String(body).split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
    .map((b) => (b.startsWith('## ') ? `<h2>${escape(b.slice(3))}</h2>` : `<p>${escape(b).replace(/\n/g, '<br>')}</p>`))
    .join('');
}

export function bodyHtml(body = '') {
  return sanitize(isHtml(body) ? body : legacyToHtml(body), OPTIONS);
}

export const plainText = (body = '') =>
  (isHtml(body) ? sanitize(body.replace(/<\/(p|h\d|li|blockquote|pre)>|<br\s*\/?>/gi, ' $&'), { allowedTags: [], allowedAttributes: {} }) : body);
