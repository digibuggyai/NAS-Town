import { useEffect, useRef, useState } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
  Bold, ClipboardPaste, ClipboardType, Copy, FileCode2, FileText, Flag, HelpCircle, ImagePlus, IndentDecrease, IndentIncrease,
  Italic, Link, List, ListOrdered, Loader2, Maximize2, Minimize2, Minus, Omega, Quote, Redo2, RemoveFormatting, Scissors,
  SpellCheck, Strikethrough, Table2, Underline, Undo2, Unlink, X,
} from 'lucide-react';
import { api, mediaUrl } from '../../lib/api.js';
import { withMediaHost, withoutMediaHost } from '../../lib/blogMedia.js';
import { cleanPastedHtml, looksLikeMarkdown, markdownToHtml } from '../../lib/pasteFormat.js';

/* The blog article editor. What you see here is what readers see: it uses the same
 * .prose-blog styles as the public post page. Everything it can produce (headings, lists,
 * quotes, links, anchors, images, tables, highlights, sub/superscript, code) is also on the
 * server's allowlist (server/src/blog-html.js), so nothing is lost when the post is saved.
 * Pasting keeps formatting from Google Docs, Word, web pages and Markdown; pasted or dropped
 * image files are uploaded and placed where they land. */

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_MB = 3;

// "Anchor": an id on a heading or paragraph, so a link to "#that-id" jumps to it.
const Anchors = Extension.create({
  name: 'anchors',
  addGlobalAttributes() {
    return [{
      types: ['heading', 'paragraph'],
      attributes: {
        // keepOnSplit: false, or pressing Enter copies the anchor onto the next line.
        id: { default: null, keepOnSplit: false, parseHTML: (el) => el.getAttribute('id'), renderHTML: (attrs) => (attrs.id ? { id: attrs.id } : {}) },
      },
    }];
  },
});

const SPECIAL_CHARS = ['₹', '©', '®', '™', '°', '×', '÷', '±', '≈', '≠', '≤', '≥', '–', '—', '…', '•', '“', '”', '‘', '’', '«', '»', '€', '£', '$', '¥', '→', '←', '↑', '↓', '✓', '✗', '½', '¼', '¾', 'µ', '§', '¶', '²', '³'];

const FORMATS = [
  ['p', 'Paragraph'],
  ['h2', 'Heading'],
  ['h3', 'Subheading'],
  ['h4', 'Small heading'],
  ['pre', 'Preformatted (code)'],
];
const STYLES = [
  ['', 'Styles'],
  ['highlight', 'Marker (highlight)'],
  ['code', 'Inline code'],
  ['superscript', 'Superscript (x²)'],
  ['subscript', 'Subscript (H₂O)'],
  ['none', 'Clear styles'],
];

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plainTextToHtml = (text) =>
  text.split(/\r?\n\s*\r?\n/).map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, '<br>')}</p>`).join('');
const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

export default function RichEditor({ value, onChange, onStats }) {
  const [full, setFull] = useState(false); // maximise
  const [source, setSource] = useState(null); // HTML source text while in Source view
  const [spell, setSpell] = useState(true);
  const [panel, setPanel] = useState(null); // 'chars' | 'help' | null
  const [uploading, setUploading] = useState(0);
  const [notice, setNotice] = useState('');
  const fileInput = useRef(null);
  const editorRef = useRef(null);

  /** Uploads image files and puts them at `pos` (or the cursor). */
  async function insertImages(files, pos) {
    const e = editorRef.current;
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) { setNotice(`${file.name}: use a JPG, PNG, WebP or AVIF image.`); continue; }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) { setNotice(`${file.name} is over ${MAX_IMAGE_MB} MB. Make it smaller and try again.`); continue; }
      setUploading((n) => n + 1);
      try {
        const { url } = await api.uploadBlogImage(file);
        const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        const node = { type: 'image', attrs: { src: mediaUrl(url), alt } }; // stored back as /api/… (withoutMediaHost)
        if (pos != null) e.chain().focus().insertContentAt(pos, node).run();
        else e.chain().focus().insertContent(node).run();
        setNotice('Image added. Click it, then "Image description" to describe it for readers and Google.');
      } catch (err) {
        setNotice(`${file.name}: ${err.message}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Anchors,
      Image.configure({ inline: false, allowBase64: false }),
      TableKit.configure({ table: { resizable: false } }),
      Highlight,
      Subscript,
      Superscript,
      Placeholder.configure({ placeholder: 'Write the article here, or paste it from Google Docs, Word, a web page or ChatGPT. Formatting is kept. Drop images anywhere.' }),
    ],
    content: withMediaHost(value || ''),
    editorProps: {
      attributes: { class: 'prose-blog min-h-[26rem] px-5 py-4 outline-none', 'aria-label': 'Article', role: 'textbox', 'aria-multiline': 'true', spellcheck: 'true' },
      transformPastedHTML: cleanPastedHtml,
      handlePaste(view, event) {
        const data = event.clipboardData;
        const images = [...(data?.files ?? [])].filter((f) => f.type.startsWith('image/'));
        if (images.length) { insertImages(images); return true; } // a screenshot or copied image
        if (!data || data.types.includes('text/html')) return false; // rich paste: handled by the editor
        const text = data.getData('text/plain');
        if (!text || !looksLikeMarkdown(text)) return false;
        view.pasteHTML(markdownToHtml(text)); // runs the normal rich-paste path with the converted HTML
        return true;
      },
      handleDrop(view, event, _slice, moved) {
        const images = [...(event.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith('image/'));
        if (moved || !images.length) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
        insertImages(images, at?.pos);
        return true;
      },
    },
    onCreate: ({ editor: e }) => onStats?.(stats(e)),
    onUpdate: ({ editor: e }) => {
      onChange(e.isEmpty ? '' : withoutMediaHost(e.getHTML()));
      onStats?.(stats(e));
    },
  });
  editorRef.current = editor;

  useEffect(() => { editor?.setOptions({ editorProps: { ...editor.options.editorProps, attributes: { ...editor.options.editorProps.attributes, spellcheck: String(spell) } } }); }, [spell, editor]);
  useEffect(() => {
    if (!full) return;
    const onKey = (e) => e.key === 'Escape' && setFull(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [full]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(t); }, [notice]);

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? {
      p: e.isActive('paragraph'), h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }), h4: e.isActive('heading', { level: 4 }),
      pre: e.isActive('codeBlock'),
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
      link: e.isActive('link'), ul: e.isActive('bulletList'), ol: e.isActive('orderedList'), quote: e.isActive('blockquote'),
      li: e.isActive('listItem'), table: e.isActive('table'), image: e.isActive('image'),
      highlight: e.isActive('highlight'), code: e.isActive('code'), sup: e.isActive('superscript'), sub: e.isActive('subscript'),
      anchor: e.getAttributes('heading').id || e.getAttributes('paragraph').id || '',
      undo: e.can().undo(), redo: e.can().redo(),
      indent: e.can().sinkListItem('listItem'), outdent: e.can().liftListItem('listItem'),
    } : {}),
  });

  if (!editor) return <div className="field min-h-[29rem]" />;
  const run = (fn) => () => fn(editor.chain().focus()).run();

  function setLink() {
    const current = editor.getAttributes('link').href ?? '';
    const url = window.prompt('Link address. Use #anchor-name to jump to an anchor in this article. Leave empty to remove the link.', current || 'https://');
    if (url === null) return;
    if (!url.trim() || url.trim() === 'https://') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  function setAnchor() {
    const type = editor.isActive('heading') ? 'heading' : 'paragraph';
    const name = window.prompt('Anchor name (lets you link straight to this heading or paragraph, e.g. #raid-levels). Leave empty to remove it.', s.anchor);
    if (name === null) return;
    const id = slug(name);
    editor.chain().focus().updateAttributes(type, { id: id || null }).run();
    if (id) setNotice(`Anchor added. Link to it with #${id}`);
  }

  function setImageAlt() {
    const alt = window.prompt('Image description (what the picture shows, for blind readers and Google)', editor.getAttributes('image').alt ?? '');
    if (alt !== null) editor.chain().focus().updateAttributes('image', { alt: alt.trim() }).run();
  }

  async function clip(kind) {
    editor.commands.focus();
    if (kind === 'cut' || kind === 'copy') {
      if (!document.execCommand(kind)) setNotice(`Your browser blocked ${kind}. Use Ctrl+${kind === 'cut' ? 'X' : 'C'}.`);
      return;
    }
    try {
      if (kind === 'text') {
        const text = await navigator.clipboard.readText();
        if (text) editor.chain().focus().insertContent(plainTextToHtml(text)).run();
        return;
      }
      // Paste / Paste from Word: the clipboard's formatted copy, cleaned like a normal paste.
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const image = item.types.find((t) => t.startsWith('image/'));
        if (image) { const blob = await item.getType(image); await insertImages([new File([blob], `pasted.${image.split('/')[1]}`, { type: image })]); return; }
        if (item.types.includes('text/html')) { const html = await (await item.getType('text/html')).text(); editor.chain().focus().insertContent(cleanPastedHtml(html)).run(); return; }
        if (item.types.includes('text/plain')) { const text = await (await item.getType('text/plain')).text(); editor.chain().focus().insertContent(looksLikeMarkdown(text) ? markdownToHtml(text) : plainTextToHtml(text)).run(); return; }
      }
    } catch {
      setNotice('Your browser asked before reading the clipboard, or blocked it. Press Ctrl+V to paste (Ctrl+Shift+V for plain text).');
    }
  }

  function setFormat(v) {
    const c = editor.chain().focus();
    ({ p: () => c.setParagraph(), h2: () => c.setHeading({ level: 2 }), h3: () => c.setHeading({ level: 3 }), h4: () => c.setHeading({ level: 4 }), pre: () => c.setCodeBlock() })[v]?.().run();
  }
  function setStyle(v) {
    const c = editor.chain().focus();
    ({
      highlight: () => c.toggleHighlight(), code: () => c.toggleCode(), superscript: () => c.unsetSubscript().toggleSuperscript(),
      subscript: () => c.unsetSuperscript().toggleSubscript(), none: () => c.unsetHighlight().unsetCode().unsetSubscript().unsetSuperscript(),
    })[v]?.().run();
  }

  function toggleSource() {
    if (source == null) { setSource(prettyHtml(withoutMediaHost(editor.getHTML()))); return; }
    editor.commands.setContent(withMediaHost(source), { emitUpdate: true });
    setSource(null);
  }

  const format = s.h2 ? 'h2' : s.h3 ? 'h3' : s.h4 ? 'h4' : s.pre ? 'pre' : 'p';
  const style = s.highlight ? 'highlight' : s.code ? 'code' : s.sup ? 'superscript' : s.sub ? 'subscript' : '';
  const off = source != null; // Source view: formatting tools are off

  // [label, Icon, active, onClick, disabled]
  const row1 = [
    [
      ['Cut (Ctrl+X)', Scissors, false, () => clip('cut'), off],
      ['Copy (Ctrl+C)', Copy, false, () => clip('copy'), off],
      ['Paste (Ctrl+V)', ClipboardPaste, false, () => clip('paste'), off],
      ['Paste as plain text (Ctrl+Shift+V)', ClipboardType, false, () => clip('text'), off],
      ['Paste from Word (keeps headings, lists and bold; drops Word styling)', FileText, false, () => clip('paste'), off],
    ],
    [
      ['Undo (Ctrl+Z)', Undo2, false, run((c) => c.undo()), off || !s.undo],
      ['Redo (Ctrl+Shift+Z)', Redo2, false, run((c) => c.redo()), off || !s.redo],
    ],
    [[spell ? 'Spell check: on (right-click a word for suggestions)' : 'Spell check: off', SpellCheck, spell, () => setSpell((v) => !v), off]],
    [
      [s.link ? 'Edit link (Ctrl+K)' : 'Add link (Ctrl+K)', Link, s.link, setLink, off],
      ['Remove link', Unlink, false, run((c) => c.extendMarkRange('link').unsetLink()), off || !s.link],
      [s.anchor ? `Anchor: #${s.anchor}` : 'Anchor (link target on this heading or paragraph)', Flag, Boolean(s.anchor), setAnchor, off],
    ],
    [
      [uploading ? 'Uploading image…' : 'Image (upload, or drop / paste one into the text)', uploading ? Loader2 : ImagePlus, false, () => fileInput.current?.click(), off || uploading > 0],
      ['Table', Table2, s.table, run((c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true })), off || s.table],
      ['Horizontal line', Minus, false, run((c) => c.setHorizontalRule()), off],
      ['Special character', Omega, panel === 'chars', () => setPanel((p) => (p === 'chars' ? null : 'chars')), off],
    ],
    [[full ? 'Exit full screen (Esc)' : 'Full screen', full ? Minimize2 : Maximize2, full, () => setFull((v) => !v)]],
  ];
  const row2 = [
    [
      ['Bold (Ctrl+B)', Bold, s.bold, run((c) => c.toggleBold()), off],
      ['Italic (Ctrl+I)', Italic, s.italic, run((c) => c.toggleItalic()), off],
      ['Underline (Ctrl+U)', Underline, s.underline, run((c) => c.toggleUnderline()), off],
      ['Strikethrough', Strikethrough, s.strike, run((c) => c.toggleStrike()), off],
      ['Remove formatting', RemoveFormatting, false, run((c) => c.unsetAllMarks().clearNodes()), off],
    ],
    [
      ['Numbered list', ListOrdered, s.ol, run((c) => c.toggleOrderedList()), off],
      ['Bulleted list', List, s.ul, run((c) => c.toggleBulletList()), off],
    ],
    [
      ['Decrease indent (Shift+Tab in a list)', IndentDecrease, false, run((c) => c.liftListItem('listItem')), off || !s.outdent],
      ['Increase indent (Tab in a list)', IndentIncrease, false, run((c) => c.sinkListItem('listItem')), off || !s.indent],
    ],
    [['Quote', Quote, s.quote, run((c) => c.toggleBlockquote()), off]],
  ];

  const Btn = ([label, Icon, active, onClick, disabled]) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-md transition-colors disabled:opacity-35 ${active ? 'bg-fg text-bg' : 'text-muted hover:bg-line hover:text-fg'}`}
    >
      <Icon className={`size-4 ${Icon === Loader2 ? 'animate-spin' : ''}`} />
    </button>
  );
  const Group = (g, gi) => <div key={gi} className="flex items-center gap-0.5 border-line pr-1.5 not-last:mr-1 not-last:border-r">{g.map(Btn)}</div>;
  const select = 'h-8 rounded-md border border-line bg-raised px-2 text-sm text-fg disabled:opacity-40';

  return (
    <div
      className={`flex flex-col overflow-hidden border border-line-strong bg-raised focus-within:border-accent ${full ? 'fixed inset-0 z-[70] rounded-none' : 'rounded-xl'}`}
      onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setLink(); } }}
    >
      <div role="toolbar" aria-label="Formatting" className="sticky top-0 z-10 border-b border-line bg-surface px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-y-1">
          {row1.map(Group)}
          <div className="flex items-center gap-0.5">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={toggleSource} aria-pressed={off} title="Edit the HTML source" className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm transition-colors ${off ? 'bg-fg text-bg' : 'text-muted hover:bg-line hover:text-fg'}`}>
              <FileCode2 className="size-4" /> Source
            </button>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-y-1 border-t border-line pt-1">
          {row2.map(Group)}
          <div className="flex items-center gap-1.5 pr-1.5">
            <select aria-label="Styles" value={style} disabled={off} onChange={(e) => setStyle(e.target.value)} className={`${select} w-32`}>
              {STYLES.map(([v, l]) => <option key={v} value={v} disabled={!v}>{l}</option>)}
            </select>
            <select aria-label="Format" value={format} disabled={off} onChange={(e) => setFormat(e.target.value)} className={`${select} w-32`}>
              {FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {Group([['Help: shortcuts and tips', HelpCircle, panel === 'help', () => setPanel((p) => (p === 'help' ? null : 'help'))]], 'help')}
        </div>

        {/* Table tools, while the cursor is in a table */}
        {s.table && !off && (
          <div className="mt-1 flex flex-wrap items-center gap-1 border-t border-line pt-1 text-xs">
            <span className="px-1 font-medium text-muted">Table:</span>
            {[
              ['Row above', (c) => c.addRowBefore()], ['Row below', (c) => c.addRowAfter()], ['Delete row', (c) => c.deleteRow()],
              ['Column left', (c) => c.addColumnBefore()], ['Column right', (c) => c.addColumnAfter()], ['Delete column', (c) => c.deleteColumn()],
              ['Header row on/off', (c) => c.toggleHeaderRow()], ['Merge cells', (c) => c.mergeCells()], ['Split cell', (c) => c.splitCell()],
            ].map(([l, fn]) => (
              <button key={l} type="button" onMouseDown={(e) => e.preventDefault()} onClick={run(fn)} className="rounded-md px-2 py-1 text-muted ring-1 ring-line hover:bg-line hover:text-fg">{l}</button>
            ))}
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={run((c) => c.deleteTable())} className="rounded-md px-2 py-1 text-error ring-1 ring-error/30 hover:bg-error/10">Delete table</button>
          </div>
        )}
        {/* Image tools, while an image is selected */}
        {s.image && !off && (
          <div className="mt-1 flex flex-wrap items-center gap-1 border-t border-line pt-1 text-xs">
            <span className="px-1 font-medium text-muted">Image:</span>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={setImageAlt} className="rounded-md px-2 py-1 text-muted ring-1 ring-line hover:bg-line hover:text-fg">Image description{editor.getAttributes('image').alt ? '' : ' (missing)'}</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={run((c) => c.deleteSelection())} className="rounded-md px-2 py-1 text-error ring-1 ring-error/30 hover:bg-error/10">Remove image</button>
          </div>
        )}
        {panel === 'chars' && (
          <div className="mt-1 flex flex-wrap gap-1 border-t border-line pt-1.5" aria-label="Special characters">
            {SPECIAL_CHARS.map((ch) => (
              <button key={ch} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().insertContent(ch).run()} className="grid size-8 place-items-center rounded-md text-base ring-1 ring-line hover:bg-line">{ch}</button>
            ))}
            <button type="button" onClick={() => setPanel(null)} aria-label="Close" className="grid size-8 place-items-center rounded-md text-muted hover:bg-line"><X className="size-4" /></button>
          </div>
        )}
        {panel === 'help' && (
          <div className="mt-1 grid gap-x-8 gap-y-1 border-t border-line pt-2 pb-1 text-xs text-muted sm:grid-cols-2">
            {[
              ['Bold / Italic / Underline', 'Ctrl+B / Ctrl+I / Ctrl+U'], ['Link', 'Ctrl+K'], ['Undo / Redo', 'Ctrl+Z / Ctrl+Shift+Z'],
              ['Paste as plain text', 'Ctrl+Shift+V'], ['Indent / outdent a list item', 'Tab / Shift+Tab'], ['New line in the same paragraph', 'Shift+Enter'],
              ['Images', 'Image button, or drop / paste a picture (JPG, PNG, WebP, AVIF, up to 3 MB)'], ['Jump links', 'Anchor a heading, then link to #its-name'],
              ['Pasting from Word / Google Docs', 'Headings, lists, bold and links are kept'], ['Full screen', 'Esc to leave'],
            ].map(([k, v]) => <p key={k}><span className="font-medium text-fg">{k}:</span> {v}</p>)}
          </div>
        )}
      </div>

      {notice && <p role="status" className="border-b border-line bg-accent-soft px-4 py-2 text-sm text-accent-strong">{notice}</p>}
      <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(',')} multiple hidden onChange={(e) => { insertImages([...e.target.files]); e.target.value = ''; }} />

      <div className={full ? 'min-h-0 flex-1 overflow-y-auto' : ''} data-lenis-prevent>
        {off ? (
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            aria-label="HTML source"
            className="block min-h-[26rem] w-full resize-y bg-raised px-5 py-4 font-mono text-[0.8125rem] leading-relaxed text-fg outline-none"
            style={full ? { height: '100%' } : undefined}
          />
        ) : (
          <div className={full ? 'mx-auto max-w-3xl' : ''}><EditorContent editor={editor} /></div>
        )}
      </div>
      {off && <p className="border-t border-line bg-surface px-4 py-2 text-xs text-muted">Editing HTML. Click <span className="font-medium text-fg">Source</span> again to go back; anything the site doesn't allow (scripts, styles) is removed on save.</p>}
    </div>
  );
}

function stats(editor) {
  const words = (editor.getText().match(/\S+/g) ?? []).length;
  return { words, mins: Math.max(1, Math.round(words / 200)) };
}

/** One block per line, so the Source view is readable. */
function prettyHtml(html) {
  return html.replace(/(<\/(p|h[2-4]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|figure)>|<hr>|<img[^>]*>)/g, '$1\n').replace(/\n{2,}/g, '\n').trim();
}
