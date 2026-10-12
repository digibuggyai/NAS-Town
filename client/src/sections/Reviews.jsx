import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, PenLine } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { Stars, StarInput } from '../components/StarRating.jsx';
import { Dialog } from '../components/configurator/parts.jsx';
import { api } from '../lib/api.js';
import { preloaded } from '../lib/preload.js';

/* Customer reviews written on this site (or added by staff from real reviews received
 * elsewhere). Only reviews approved in Admin → Reviews appear here; nothing is invented.
 * With none published yet, the section simply invites the first review.
 * Names are never shown (the API doesn't send them): a review reads as
 * "Photographer, Delhi · Synology DS925+". More than three become a carousel. */

const CAROUSEL_FROM = 4;
const SOURCE = { google: 'Google review', whatsapp: 'Shared on WhatsApp', 'in-store': 'In person', email: 'By email', website: 'NASTOWN customer' };
const monthYear = (iso) => new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

export default function Reviews() {
  const [data, setData] = useState(() => preloaded('/reviews') ?? null);
  const [writing, setWriting] = useState(false);
  const track = useRef(null);
  const scrollBy = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * (el.firstElementChild?.offsetWidth ?? 320) * 1.05, behavior: 'smooth' });
  };

  useEffect(() => {
    api.reviews().then(setData).catch(() => setData({ reviews: [], count: 0, average: null }));
  }, []);

  const reviews = data?.reviews ?? [];
  const carousel = reviews.length >= CAROUSEL_FROM;

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">Customer reviews</p>
            <h2 className="h-section">What our customers say about NAS</h2>
            {data?.count > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-3 text-muted">
                <span className="text-3xl font-medium tracking-tight text-fg">{data.average.toFixed(1)}</span>
                <Stars value={data.average} />
                <span>from {data.count} {data.count === 1 ? 'review' : 'reviews'}</span>
              </p>
            )}
          </div>
          <button onClick={() => setWriting(true)} className="btn btn-primary">
            <PenLine className="size-4" /> Write a review
          </button>
        </Reveal>

        {data == null ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-raised ring-1 ring-line" />)}
          </div>
        ) : reviews.length === 0 ? (
          <Reveal className="mt-10 rounded-2xl border border-dashed border-line-strong bg-raised p-8 text-center">
            <p className="text-lg font-medium">Bought a NAS from us?</p>
            <p className="mx-auto mt-2 max-w-md text-muted">Be the first to tell others how it's going. A short review helps people choosing their first NAS.</p>
          </Reveal>
        ) : (
          <>
            {/* Up to three: a grid. More: a swipeable carousel with arrows. */}
            <ul
              ref={track}
              data-lenis-prevent-wheel
              className={carousel
                ? '-mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6'
                : 'mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3'}
              aria-label="Customer reviews"
            >
              {reviews.map((r, i) => (
                <li key={r.id} className={carousel ? 'w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.85rem)]' : ''}>
                  <Reveal as="figure" delay={(i % 3) * 80} className="flex h-full flex-col rounded-2xl bg-raised p-6 ring-1 ring-line">
                    <Stars value={r.rating} size="size-4" />
                    <blockquote className="mt-4 leading-relaxed whitespace-pre-line">“{r.body}”</blockquote>
                    <figcaption className="mt-auto pt-5 text-sm">
                      <span className="font-medium">{[r.role, r.city].filter(Boolean).join(', ') || 'NASTOWN customer'}</span>
                      {r.product && <span className="text-muted"> · {r.product}</span>}
                      <span className="mt-0.5 block text-xs text-subtle">{[SOURCE[r.source] ?? 'Customer', monthYear(r.createdAt)].join(' · ')}</span>
                    </figcaption>
                  </Reveal>
                </li>
              ))}
            </ul>
            {carousel && (
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous reviews" className="grid size-11 place-items-center rounded-full bg-raised ring-1 ring-line-strong hover:text-accent hover:ring-accent"><ChevronLeft className="size-5" /></button>
                <button type="button" onClick={() => scrollBy(1)} aria-label="Next reviews" className="grid size-11 place-items-center rounded-full bg-raised ring-1 ring-line-strong hover:text-accent hover:ring-accent"><ChevronRight className="size-5" /></button>
              </div>
            )}
          </>
        )}
      </div>
      <WriteReview open={writing} onClose={() => setWriting(false)} />
    </section>
  );
}

function WriteReview({ open, onClose }) {
  const [rating, setRating] = useState(0);
  const [state, setState] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!rating) { setError('Please choose a star rating.'); return; }
    setState('sending');
    setError('');
    try {
      await api.submitReview({ ...Object.fromEntries(new FormData(e.currentTarget)), rating });
      setState('sent');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }
  const close = () => { onClose(); if (state === 'sent') { setState('idle'); setRating(0); } };

  return (
    <Dialog open={open} onClose={close} title="Write a review">
      {state === 'sent' ? (
        <div className="py-4 text-center" role="status">
          <p className="text-lg font-medium">Thank you!</p>
          <p className="mt-2 text-muted">Your review has been received. It will appear on the site after a quick check by our team.</p>
          <button onClick={close} className="btn btn-secondary mt-6">Close</button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4 pb-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm text-muted">Your rating <span className="text-error">*</span></span>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <label>
            <span className="mb-1.5 block text-sm text-muted">Your name <span className="text-error">*</span> <span className="text-subtle">(not published)</span></span>
            <input name="name" required maxLength={80} autoComplete="name" className="field !py-2.5" />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-muted">What you do <span className="text-subtle">(optional)</span></span>
            <input name="role" maxLength={80} placeholder="e.g. Photographer, CA firm" className="field !py-2.5" />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-muted">City</span>
            <input name="city" maxLength={60} autoComplete="address-level2" className="field !py-2.5" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm text-muted">Which NAS or service? <span className="text-subtle">(optional)</span></span>
            <input name="product" maxLength={120} placeholder="e.g. Synology DS925+ with installation" className="field !py-2.5" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm text-muted">Your review <span className="text-error">*</span></span>
            <textarea name="body" required minLength={10} maxLength={2000} rows={4} placeholder="How was the buying, setup and support experience?" className="field resize-y" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm text-muted">Email <span className="text-subtle">(optional, never shown)</span></span>
            <input name="email" type="email" maxLength={200} autoComplete="email" className="field !py-2.5" />
          </label>
          {/* Honeypot: hidden from people, filled in by spam bots. */}
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          {error && <p role="alert" className="text-sm text-error sm:col-span-2">{error}</p>}
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button disabled={state === 'sending'} className="btn btn-primary">{state === 'sending' && <Loader2 className="size-4 animate-spin" />}Submit review</button>
            <p className="text-xs text-subtle">Reviews are checked before they appear. We publish your role, city and product, never your name.</p>
          </div>
        </form>
      )}
    </Dialog>
  );
}
