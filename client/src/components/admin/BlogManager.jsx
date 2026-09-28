import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, formatPostDate, mediaUrl } from '../../lib/api.js';

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const today = () => new Date().toISOString().slice(0, 10);
const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const EMPTY = { title: '', slug: '', category: '', excerpt: '', body: '', coverImage: '', coverAlt: '', published: true, publishedAt: today() };

/** Admin → Blog: list, create, edit, publish/unpublish and delete posts. */
export default function BlogManager() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = list view; {} = new post; post = edit

  const load = () => api.adminPosts().then(setPosts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function remove(p) {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    try { await api.deletePost(p.id); load(); } catch (e) { alert(e.message); }
  }

  async function togglePublished(p) {
    try { await api.updatePost(p.id, { published: !p.published }); load(); } catch (e) { alert(e.message); }
  }

  if (editing) {
    return <PostEditor post={editing} onDone={() => { setEditing(null); load(); }} />;
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Blog</h1>
          <p className="mt-1 text-sm text-muted">Published posts appear on the homepage ("From the blog") and the Blog page, newest first.</p>
        </div>
        <button onClick={() => setEditing({})} className="btn btn-primary !py-2 !text-sm"><Plus className="size-4" /> New post</button>
      </div>

      {error && <p className="mt-6 text-error">{error}</p>}
      {!posts && !error && <Loader2 className="mt-6 size-5 animate-spin text-muted" />}
      {posts?.length === 0 && (
        <div className="panel mt-6 p-10 text-center">
          <p className="font-medium">No posts yet</p>
          <p className="mt-1 text-sm text-muted">Write your first post and it will show on the homepage.</p>
        </div>
      )}

      <ul className="mt-6 grid gap-3">
        {posts?.map((p) => (
          <li key={p.id} className="panel flex flex-wrap items-center gap-4 p-3 sm:flex-nowrap">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface">
              {p.coverImage && <img src={mediaUrl(p.coverImage)} alt="" className="size-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.title}</p>
              <p className="text-xs text-subtle">
                {p.category ? `${p.category} · ` : ''}{formatPostDate(p.publishedAt)} · {p.readMins} min read · /blog/{p.slug}
              </p>
            </div>
            <button
              onClick={() => togglePublished(p)}
              title={p.published ? 'Click to unpublish' : 'Click to publish'}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.published ? 'bg-[#dcfce7] text-[#166534]' : 'bg-surface text-subtle ring-1 ring-line'}`}
            >
              {p.published ? 'Published' : 'Draft'}
            </button>
            <div className="flex items-center">
              {p.published && (
                <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" aria-label="View on site" className="rounded-full p-2 text-muted hover:bg-surface hover:text-fg"><ExternalLink className="size-4" /></a>
              )}
              <button onClick={() => setEditing(p)} aria-label="Edit" className="rounded-full p-2 text-muted hover:bg-surface hover:text-fg"><Pencil className="size-4" /></button>
              <button onClick={() => remove(p)} aria-label="Delete" className="rounded-full p-2 text-subtle hover:bg-error/10 hover:text-error"><Trash2 className="size-4" /></button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PostEditor({ post, onDone }) {
  const isNew = !post.id;
  const [f, setF] = useState({ ...EMPTY, ...post, publishedAt: post.publishedAt ?? today() });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);
  const set = (patch) => setF((s) => ({ ...s, ...patch }));

  async function upload(file) {
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError('Cover must be a JPG, PNG, WebP or AVIF image.');
    if (file.size > MAX_BYTES) return setError('Cover image must be 3 MB or smaller.');
    setError('');
    setUploading(true);
    try {
      const { url } = await api.uploadBlogImage(file);
      set({ coverImage: url, coverAlt: f.coverAlt || f.title });
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = {
      title: f.title, slug: f.slug || slugify(f.title), category: f.category, excerpt: f.excerpt, body: f.body,
      coverImage: f.coverImage || '', coverAlt: f.coverAlt, published: f.published, publishedAt: f.publishedAt,
    };
    try {
      if (isNew) await api.createPost(data);
      else await api.updatePost(post.id, data);
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const words = (f.body.match(/\S+/g) ?? []).length;

  return (
    <form onSubmit={save}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={onDone} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft className="size-4" /> All posts</button>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={f.published} onChange={(e) => set({ published: e.target.checked })} className="size-4 accent-[#3a67ff]" />
            Published
          </label>
          <button disabled={busy || uploading} className="btn btn-primary !py-2 !text-sm">
            {busy && <Loader2 className="size-4 animate-spin" />}{isNew ? 'Create post' : 'Save changes'}
          </button>
        </div>
      </div>
      <h1 className="mt-4 text-2xl font-medium tracking-tight">{isNew ? 'New post' : 'Edit post'}</h1>
      {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid content-start gap-4">
          <label>
            <span className="mb-1 block text-sm text-muted">Title *</span>
            <input
              required
              value={f.title}
              onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              className="field text-lg font-medium"
              placeholder="e.g. How to choose drives for your NAS"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm text-muted">Excerpt <span className="text-subtle">(shown on cards, 1–2 sentences)</span></span>
            <textarea rows={2} maxLength={400} value={f.excerpt ?? ''} onChange={(e) => set({ excerpt: e.target.value })} className="field resize-y" />
          </label>
          <label>
            <span className="mb-1 flex justify-between text-sm text-muted">
              <span>Article</span>
              <span className="text-subtle">{words} words · ~{Math.max(1, Math.round(words / 200))} min read</span>
            </span>
            <textarea rows={18} value={f.body ?? ''} onChange={(e) => set({ body: e.target.value })} className="field resize-y font-mono text-[0.9rem] leading-relaxed" placeholder={'Write the article here.\n\nLeave a blank line between paragraphs.\n\n## Start a line with two hashes for a subheading'} />
            <span className="mt-1 block text-xs text-subtle">Blank line = new paragraph. A line starting with <code>## </code> becomes a subheading.</span>
          </label>
        </div>

        <aside className="grid content-start gap-4">
          {/* Cover image ("wallpaper") */}
          <div>
            <span className="mb-1 block text-sm text-muted">Cover image</span>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]); }}
              className={`relative aspect-[16/10] overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${drag ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface'}`}
            >
              {f.coverImage ? (
                <>
                  <img src={mediaUrl(f.coverImage)} alt="" className="size-full object-cover" />
                  <button type="button" onClick={() => set({ coverImage: '' })} aria-label="Remove cover" className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"><X className="size-4" /></button>
                </>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="grid size-full place-items-center text-center text-sm text-muted">
                  <span>
                    <ImagePlus className="mx-auto size-7 text-accent" />
                    <span className="mt-2 block font-medium text-fg">Click or drop an image</span>
                    <span className="block text-xs">JPG, PNG, WebP · max 3 MB · landscape works best</span>
                  </span>
                </button>
              )}
              {uploading && <div className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="size-6 animate-spin text-accent" /></div>}
            </div>
            <input ref={fileRef} type="file" accept={TYPES.join(',')} className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
            {f.coverImage && (
              <button type="button" onClick={() => fileRef.current?.click()} className="link mt-2 text-sm">Replace image</button>
            )}
          </div>
          <label>
            <span className="mb-1 block text-sm text-muted">Image description <span className="text-subtle">(for accessibility)</span></span>
            <input value={f.coverAlt ?? ''} onChange={(e) => set({ coverAlt: e.target.value })} className="field !py-2 text-sm" placeholder="What the picture shows" />
          </label>
          <label>
            <span className="mb-1 block text-sm text-muted">Category</span>
            <input value={f.category ?? ''} onChange={(e) => set({ category: e.target.value })} className="field !py-2 text-sm" placeholder="e.g. Buying guide" list="blog-categories" />
            <datalist id="blog-categories">
              {['Buying guide', 'Photography', 'Video', 'Business', 'Security', 'How-to', 'News'].map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
          <label>
            <span className="mb-1 block text-sm text-muted">Publish date</span>
            <input type="date" value={f.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} className="field !py-2 text-sm" />
          </label>
          <label>
            <span className="mb-1 block text-sm text-muted">Web address</span>
            <div className="flex items-center rounded-xl border border-line-strong bg-raised pl-3 text-sm text-subtle focus-within:border-accent">
              /blog/
              <input value={f.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} className="min-w-0 flex-1 bg-transparent py-2 pr-3 text-fg outline-none" />
            </div>
          </label>
        </aside>
      </div>
    </form>
  );
}
