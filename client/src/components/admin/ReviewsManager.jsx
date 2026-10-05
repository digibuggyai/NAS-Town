import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Dialog } from '../configurator/parts.jsx';
import { Stars, StarInput } from '../StarRating.jsx';

/* Admin → Reviews. Reviews written on the site arrive as "Waiting"; publish them to show
 * them on the homepage, hide them, edit or delete. "Add review" is for real reviews received
 * elsewhere (Google, WhatsApp, in person); copy them word for word. Every change is logged. */

const STATUS = { pending: 'Waiting', published: 'Published', hidden: 'Hidden' };
const SOURCES = { website: 'Website', google: 'Google', whatsapp: 'WhatsApp', 'in-store': 'In person', email: 'Email' };
const VIEWS = [['pending', 'Waiting'], ['published', 'Published'], ['hidden', 'Hidden'], ['all', 'All']];
const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function ReviewsManager() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('pending');
  const [editing, setEditing] = useState(null); // review, or {} to add
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => api.adminReviews().then(setRows).catch(setError);
  useEffect(() => { load(); }, []);

  async function setStatus(r, status) {
    setBusy(r.id); setMsg('');
    try {
      const updated = await api.updateReview(r.id, { status });
      setRows((all) => all.map((x) => (x.id === r.id ? updated : x)));
      setMsg(`${r.name}'s review is now ${STATUS[status].toLowerCase()}.`);
    } catch (e) { setMsg(e.message); } finally { setBusy(null); }
  }

  async function remove(r) {
    if (!window.confirm(`Delete ${r.name}'s ${r.rating}-star review? A copy is kept in the change log.`)) return;
    setBusy(r.id); setMsg('');
    try {
      await api.deleteReview(r.id);
      setRows((all) => all.filter((x) => x.id !== r.id));
      setMsg(`Deleted ${r.name}'s review.`);
    } catch (e) { setMsg(e.message); } finally { setBusy(null); }
  }

  if (error) return <p className="text-error">{error.message}</p>;
  if (!rows) return <Loader2 className="size-5 animate-spin text-muted" />;
  const count = (k) => (k === 'all' ? rows.length : rows.filter((r) => r.status === k).length);
  const list = view === 'all' ? rows : rows.filter((r) => r.status === view);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Reviews</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Reviews written on the site wait here until you publish them. Add real reviews you've received on Google, WhatsApp or in person,
            copied word for word. Every change is recorded in the change log.
          </p>
        </div>
        <button onClick={() => { setMsg(''); setEditing({}); }} className="btn btn-primary !px-4 !py-2 !text-xs"><Plus className="size-3.5" /> Add review</button>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
        {VIEWS.map(([k, labelText]) => (
          <button key={k} onClick={() => setView(k)} aria-pressed={view === k} className="chip !py-1.5 !text-xs">
            {labelText} <span className="opacity-60">{count(k)}</span>
          </button>
        ))}
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-muted">{msg}</p>}

      <div className="mt-4 grid gap-3">
        {list.length === 0 && <p className="rounded-lg p-4 text-muted ring-1 ring-line">{view === 'pending' ? 'No reviews waiting for approval.' : 'No reviews here.'}</p>}
        {list.map((r) => (
          <article key={r.id} className={`glass rounded-xl p-5 ${r.status === 'hidden' ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars value={r.rating} />
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === 'published' ? 'bg-success/10 text-success' : r.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-surface text-muted'}`}>
                    {STATUS[r.status]}
                  </span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{SOURCES[r.source] ?? r.source}</span>
                </div>
                <p className="mt-2 font-medium">
                  {r.name}{r.city && <span className="font-normal text-muted">, {r.city}</span>}
                  {r.product && <span className="font-normal text-muted"> · {r.product}</span>}
                </p>
                <p className="mt-0.5 text-xs text-subtle">{when(r.createdAt)}{r.email && <> · <a href={`mailto:${r.email}`} className="link">{r.email}</a></>}</p>
              </div>
              <div className="flex items-center gap-1">
                {r.status !== 'published' ? (
                  <button onClick={() => setStatus(r, 'published')} disabled={busy != null} className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs text-white disabled:opacity-50">
                    <Eye className="size-3.5" /> Publish
                  </button>
                ) : (
                  <button onClick={() => setStatus(r, 'hidden')} disabled={busy != null} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted ring-1 ring-line hover:bg-surface disabled:opacity-50">
                    <EyeOff className="size-3.5" /> Hide
                  </button>
                )}
                <button onClick={() => { setMsg(''); setEditing(r); }} disabled={busy != null} aria-label={`Edit ${r.name}'s review`} className="rounded-full p-2 text-muted hover:bg-surface hover:text-fg"><Pencil className="size-4" /></button>
                <button onClick={() => remove(r)} disabled={busy != null} aria-label={`Delete ${r.name}'s review`} className="rounded-full p-2 text-subtle hover:bg-error/10 hover:text-error">
                  {busy === r.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </button>
              </div>
            </div>
            <p className="mt-3 leading-relaxed whitespace-pre-line">{r.body}</p>
          </article>
        ))}
      </div>

      <ReviewEditor
        review={editing}
        onClose={() => setEditing(null)}
        onSaved={(saved, isNew) => {
          setRows((all) => (isNew ? [saved, ...all] : all.map((x) => (x.id === saved.id ? saved : x))));
          setMsg(isNew ? `Added ${saved.name}'s review.` : `Saved ${saved.name}'s review.`);
          if (isNew) setView(saved.status);
        }}
      />
    </section>
  );
}

function ReviewEditor({ review, onClose, onSaved }) {
  const isNew = review && !review.id;
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setRating(review?.rating ?? 0); setError(''); }, [review]);

  async function save(e) {
    e.preventDefault();
    if (!rating) { setError('Choose a star rating.'); return; }
    const data = { ...Object.fromEntries(new FormData(e.currentTarget)), rating };
    setBusy(true); setError('');
    try {
      const saved = isNew ? await api.createReview(data) : await api.updateReview(review.id, data);
      onSaved(saved, isNew);
      onClose();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  const field = 'field !py-2 text-sm';
  return (
    <Dialog open={review != null} onClose={onClose} title={isNew ? 'Add a review' : 'Edit review'}>
      {review && (
        <form key={review.id ?? 'new'} onSubmit={save} className="grid gap-3 pb-2 sm:grid-cols-2">
          {isNew && <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning sm:col-span-2">Only add real reviews you've received, copied word for word, with the customer's real name.</p>}
          <div className="sm:col-span-2">
            <span className="mb-1 block text-xs text-muted">Rating *</span>
            <StarInput value={rating} onChange={setRating} name="edit-rating" />
          </div>
          <label><span className="mb-1 block text-xs text-muted">Name *</span><input name="name" required maxLength={80} defaultValue={review.name ?? ''} className={field} /></label>
          <label><span className="mb-1 block text-xs text-muted">City</span><input name="city" maxLength={60} defaultValue={review.city ?? ''} className={field} /></label>
          <label className="sm:col-span-2"><span className="mb-1 block text-xs text-muted">Product or service</span><input name="product" maxLength={120} defaultValue={review.product ?? ''} className={field} /></label>
          <label className="sm:col-span-2"><span className="mb-1 block text-xs text-muted">Review *</span><textarea name="body" required minLength={10} maxLength={2000} rows={5} defaultValue={review.body ?? ''} className={`${field} resize-y`} /></label>
          <label><span className="mb-1 block text-xs text-muted">Where it came from</span>
            <select name="source" defaultValue={review.source ?? 'google'} className={field}>
              {Object.entries(SOURCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label><span className="mb-1 block text-xs text-muted">Status</span>
            <select name="status" defaultValue={review.status ?? 'published'} className={field}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="sm:col-span-2"><span className="mb-1 block text-xs text-muted">Email (private, never shown)</span><input name="email" type="email" maxLength={200} defaultValue={review.email ?? ''} className={field} /></label>
          {!isNew && review.source === 'website' && <p className="text-xs text-subtle sm:col-span-2">This is the customer's own text: fix typos only, don't change what they said.</p>}
          {error && <p role="alert" className="text-sm text-error sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn btn-secondary !py-2">Cancel</button>
            <button disabled={busy} className="btn btn-primary !py-2">{busy ? 'Saving…' : isNew ? 'Add review' : 'Save'}</button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
