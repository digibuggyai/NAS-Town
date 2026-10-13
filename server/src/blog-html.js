// Blog bodies are stored as HTML written by the admin rich-text editor. Everything is run
// through an allowlist on the way in and on the way out, so only formatting survives:
// no scripts, styles, classes, iframes or event handlers can reach a reader's browser.
import sanitize from 'sanitize-html';

// Images: only ones uploaded through the editor (/api/blog/images/N) or the site's own
// /images/… files, so an article never hotlinks someone else's picture.
const OWN_IMAGE = /^(\/api\/blog\/images\/\d+|\/images\/[\w./-]+)$/;
// Anchors ("#raid-levels"): plain slugs only.
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
    h1: 'h2', // the post title is the page's only h1
    h5: 'h4',
    h6: 'h4',
    b: 'strong',
    i: 'em',
    strike: 's',
    del: 's',
    img: (tag, attribs) => {
      // An uploaded image's full address (https://<api>/api/blog/images/N) is stored as the short path.
      const src = String(attribs.src ?? '').replace(/^https?:\/\/[^/]+(?=\/api\/blog\/images\/)/, '');
      return OWN_IMAGE.test(src)
        ? { tagName: 'img', attribs: { src, alt: String(attribs.alt ?? '').slice(0, 300), ...(attribs.title ? { title: String(attribs.title).slice(0, 300) } : {}) } }
        : { tagName: 'img', attribs: {} }; // dropped below
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

/** colspan / rowspan kept only as small whole numbers. */
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

/** Posts written before the rich editor: blank line = paragraph, "## " = subheading. */
function legacyToHtml(body = '') {
  return String(body).split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
    .map((b) => (b.startsWith('## ') ? `<h2>${escape(b.slice(3))}</h2>` : `<p>${escape(b).replace(/\n/g, '<br>')}</p>`))
    .join('');
}

/** Any stored body (HTML or legacy text) as clean HTML. */
export function bodyHtml(body = '') {
  return sanitize(isHtml(body) ? body : legacyToHtml(body), OPTIONS);
}

/** Text only, for word counts. Block ends become spaces so paragraphs don't run together. */
export const plainText = (body = '') =>
  (isHtml(body) ? sanitize(body.replace(/<\/(p|h\d|li|blockquote|pre)>|<br\s*\/?>/gi, ' $&'), { allowedTags: [], allowedAttributes: {} }) : body);
