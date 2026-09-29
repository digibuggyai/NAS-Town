import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import {
  Bold, Code, Heading2, Heading3, Italic, Link, List, ListOrdered, Minus, Pilcrow, Quote, Redo2, RemoveFormatting,
  Strikethrough, Underline, Undo2, Unlink,
} from 'lucide-react';
import { cleanPastedHtml, looksLikeMarkdown, markdownToHtml } from '../../lib/pasteFormat.js';

/* The blog article editor. What you see here is what readers see: it uses the same
 * .prose-blog styles as the public post page. Pasting keeps headings, bold, italic,
 * links, lists, quotes and code from Google Docs, Word, web pages and Markdown. */

export default function RichEditor({ value, onChange, onStats }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Placeholder.configure({ placeholder: 'Write the article here, or paste it from Google Docs, Word, a web page or ChatGPT. Formatting is kept.' }),
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'prose-blog min-h-[26rem] px-5 py-4 outline-none', 'aria-label': 'Article', role: 'textbox', 'aria-multiline': 'true' },
      transformPastedHTML: cleanPastedHtml,
      handlePaste(view, event) {
        const data = event.clipboardData;
        if (!data || data.types.includes('text/html')) return false; // rich paste: handled by the editor
        const text = data.getData('text/plain');
        if (!text || !looksLikeMarkdown(text)) return false;
        view.pasteHTML(markdownToHtml(text)); // runs the normal rich-paste path with the converted HTML
        return true;
      },
    },
    onCreate: ({ editor: e }) => onStats?.(stats(e)),
    onUpdate: ({ editor: e }) => {
      onChange(e.isEmpty ? '' : e.getHTML());
      onStats?.(stats(e));
    },
  });

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? {
      p: e.isActive('paragraph'), h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }),
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
      code: e.isActive('code'), link: e.isActive('link'), ul: e.isActive('bulletList'), ol: e.isActive('orderedList'),
      quote: e.isActive('blockquote'), undo: e.can().undo(), redo: e.can().redo(),
    } : {}),
  });

  if (!editor) return <div className="field min-h-[29rem]" />;
  const run = (fn) => () => fn(editor.chain().focus()).run();

  function setLink() {
    const current = editor.getAttributes('link').href ?? '';
    const url = window.prompt('Link address (leave empty to remove the link)', current || 'https://');
    if (url === null) return;
    if (!url.trim() || url.trim() === 'https://') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  const groups = [
    [
      ['Paragraph', Pilcrow, s.p, run((c) => c.setParagraph())],
      ['Heading', Heading2, s.h2, run((c) => c.toggleHeading({ level: 2 }))],
      ['Subheading', Heading3, s.h3, run((c) => c.toggleHeading({ level: 3 }))],
    ],
    [
      ['Bold (Ctrl+B)', Bold, s.bold, run((c) => c.toggleBold())],
      ['Italic (Ctrl+I)', Italic, s.italic, run((c) => c.toggleItalic())],
      ['Underline (Ctrl+U)', Underline, s.underline, run((c) => c.toggleUnderline())],
      ['Strikethrough', Strikethrough, s.strike, run((c) => c.toggleStrike())],
      ['Inline code', Code, s.code, run((c) => c.toggleCode())],
    ],
    [
      [s.link ? 'Edit link' : 'Add link (Ctrl+K)', Link, s.link, setLink],
      ...(s.link ? [['Remove link', Unlink, false, run((c) => c.extendMarkRange('link').unsetLink())]] : []),
    ],
    [
      ['Bulleted list', List, s.ul, run((c) => c.toggleBulletList())],
      ['Numbered list', ListOrdered, s.ol, run((c) => c.toggleOrderedList())],
      ['Quote', Quote, s.quote, run((c) => c.toggleBlockquote())],
      ['Divider', Minus, false, run((c) => c.setHorizontalRule())],
    ],
    [
      ['Clear formatting', RemoveFormatting, false, run((c) => c.unsetAllMarks().clearNodes())],
      ['Undo (Ctrl+Z)', Undo2, false, run((c) => c.undo()), !s.undo],
      ['Redo (Ctrl+Shift+Z)', Redo2, false, run((c) => c.redo()), !s.redo],
    ],
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border border-line-strong bg-raised focus-within:border-accent"
      onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setLink(); } }}
    >
      <div role="toolbar" aria-label="Formatting" className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-surface px-2 py-1.5">
        {groups.map((g, gi) => (
          <div key={gi} className="flex items-center gap-0.5 border-line pr-1.5 not-last:mr-1 not-last:border-r">
            {g.map(([label, Icon, active, onClick, disabled]) => (
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
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function stats(editor) {
  const words = (editor.getText().match(/\S+/g) ?? []).length;
  return { words, mins: Math.max(1, Math.round(words / 200)) };
}
