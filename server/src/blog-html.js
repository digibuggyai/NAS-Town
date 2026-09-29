// Blog bodies are stored as HTML written by the admin rich-text editor. Everything is run
// through an allowlist on the way in and on the way out, so only formatting survives:
// no scripts, styles, classes, iframes or event handlers can reach a reader's browser.
import sanitize from 'sanitize-html';

const OPTIONS = {
  allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'hr', 'code', 'pre'],
  allowedAttributes: { a: ['href', 'target', 'rel'], ol: ['start'] },
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
    a: (tag, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? '');
      return { tagName: 'a', attribs: external ? { href: attribs.href, target: '_blank', rel: 'noopener noreferrer' } : { href: attribs.href } };
    },
  },
  exclusiveFilter: (frame) => ['p', 'h2', 'h3', 'h4', 'li', 'blockquote'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren?.length,
};

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
