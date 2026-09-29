// Clean-up for text pasted into the blog editor, so formatting copied from Google Docs,
// Word, web pages or ChatGPT arrives looking the same. The editor then keeps only the
// formatting it supports (headings, bold, italic, links, lists, quotes, code), and the
// server sanitises again on save.

/** Pasted HTML: fix the quirks of Word and Google Docs before the editor parses it. */
export function cleanPastedHtml(html) {
  let out = html
    .replace(/<!--[\s\S]*?-->/g, '') // Word conditional comments
    .replace(/<\/?o:p[^>]*>/gi, '')
    .replace(/<(\/?)h1(\s|>)/gi, '<$1h2$2') // the post title is the page's h1
    .replace(/<(\/?)h[56](\s|>)/gi, '<$1h4$2');
  if (/mso-list/i.test(out)) out = wordLists(out);
  return out;
}

/** Word pastes list items as styled paragraphs with a fake bullet; rebuild real lists. */
function wordLists(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const items = [...doc.body.querySelectorAll('p')].filter((p) => /mso-list/i.test(p.getAttribute('style') ?? ''));
  let list = null;
  for (const p of items) {
    const marker = p.querySelector('[style*="mso-list:Ignore"], [style*="mso-list: Ignore"]');
    const ordered = /^\s*(\d+|[a-z]|[ivx]+)[.)]/i.test(marker?.textContent ?? '');
    marker?.remove();
    const tag = ordered ? 'OL' : 'UL';
    // Continue the list only if this item directly follows the previous one.
    if (!list || list.tagName !== tag || list.nextElementSibling !== p) {
      list = doc.createElement(tag);
      p.before(list);
    }
    const li = doc.createElement('li');
    li.innerHTML = p.innerHTML.replace(/^(\s|&nbsp;)+/, '');
    list.append(li);
    p.remove();
  }
  return doc.body.innerHTML;
}

/* ---------------- Markdown (e.g. ChatGPT's copy button) ---------------- */

const MD_HINT = /^(#{1,6}\s|\s*[-*+]\s+\S|\s*\d+[.)]\s+\S|>\s?|```)|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\)/m;

/** Plain text that is clearly Markdown, not just prose. */
export const looksLikeMarkdown = (text) => MD_HINT.test(text);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, '<strong>$2</strong>')
    .replace(/(^|[^*\w])\*(?=\S)([^*]+?)(?<=\S)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)(.+?)(?<=\S)~~/g, '<s>$1</s>');
}

/** A small Markdown → HTML converter covering what articles use. */
export function markdownToHtml(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  let list = null; // { tag, items }
  let quote = [];
  const flushPara = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = []; };
  const flushList = () => { if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; };
  const flushQuote = () => { if (quote.length) out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`); quote = []; };
  const flush = () => { flushPara(); flushList(); flushQuote(); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    if (/^```/.test(line)) {
      flush();
      const code = [];
      while (++i < lines.length && !/^```/.test(lines[i])) code.push(lines[i]);
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
    } else if (!line.trim()) {
      flush();
    } else if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      flush();
      const level = Math.min(4, Math.max(2, m[1].length));
      out.push(`<h${level}>${inline(m[2].replace(/\s#+\s*$/, ''))}</h${level}>`);
    } else if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flush();
      out.push('<hr>');
    } else if ((m = line.match(/^\s*(?:[-*+]|(\d+)[.)])\s+(.*)$/))) {
      flushPara(); flushQuote();
      const tag = m[1] ? 'ol' : 'ul';
      if (list?.tag !== tag) { flushList(); list = { tag, items: [] }; }
      list.items.push(m[2]);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flushPara(); flushList();
      quote.push(m[1]);
    } else if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`; // wrapped list item
    } else {
      flushList(); flushQuote();
      para.push(line.trim());
    }
  }
  flush();
  return out.join('');
}
