import { Link } from 'react-router';
import { SlidersHorizontal } from 'lucide-react';
import ProductPhoto, { useTilt } from './ProductPhoto.jsx';
import { formatInr } from '../lib/api.js';
import { brandName } from '../data/site.js';

/** Short, factual spec lines for the entry. */
function specLines(p) {
  const top = Math.max(0, ...[...String(p.network ?? '').matchAll(/(\d+(?:\.\d+)?)\s*GbE/gi)].map((m) => Number(m[1])));
  return [
    ['CPU', p.cpu],
    ['Network', top >= 10 ? '10GbE' : top >= 2.5 ? '2.5GbE' : '1GbE'],
    ['Memory', p.memory?.split(' (')[0]],
    p.m2_slots ? ['M.2', `${p.m2_slots} × NVMe`] : null,
  ].filter((r) => r && r[1]);
}

/** A catalogue entry, not a card: figure, name, specs, price. The whole entry is one link target. */
export default function ProductCard({ product: p }) {
  const bestFor = (p.best_for ?? '').split('•').map((s) => s.trim()).filter(Boolean);
  // The whole entry is a link (it covers the plate), so the entry takes the pointer.
  const { plateRef, handlers } = useTilt();
  return (
    <article className="group relative flex flex-col" {...handlers}>
      <div ref={plateRef} className="plate tilt grid h-52 place-items-center border border-line bg-raised px-6 py-6 transition-colors group-hover:border-line-strong">
        <ProductPhoto model={p.shortModel ?? p.model} bays={p.bays} alt="" className="tilt-media h-36 w-full" />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="eyebrow">{brandName(p.brand)} · {p.bays}-Bay NAS</p>
        {p.expandable && <p className="mono text-xs text-subtle">Expandable</p>}
      </div>
      <h3 className="mt-1.5 text-xl">
        <Link to={`/products/${p.slug}`} className="after:absolute after:inset-0">{p.model}</Link>
      </h3>
      {bestFor.length > 0 && <p className="mt-1 text-[0.95rem] text-muted">{bestFor.join(', ')}</p>}

      <dl className="mono mt-4 mb-4 grid gap-1 border-t border-line pt-3 text-[0.8rem]">
        {specLines(p).map(([k, v]) => (
          <div key={k} className="grid grid-cols-[4.5rem_1fr] gap-2">
            <dt className="text-subtle">{k}</dt>
            <dd className="truncate">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto border-t border-line pt-4">
        {p.price_inr != null && (
          <p>
            <span className="mono block text-xs text-subtle">Diskless · GST incl.</span>
            <span className="text-lg font-medium">{formatInr(p.price_inr)}</span>
          </p>
        )}
        {/* Above the card-wide link, so each button is its own target. */}
        <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
          <Link to={`/tools/configurator?model=${p.slug}`} className="btn btn-primary btn-sm">
            <SlidersHorizontal className="size-3.5" aria-hidden /> Configure
          </Link>
          <Link to={`/products/${p.slug}`} className="btn btn-secondary btn-sm" aria-label={`Details: ${p.model}`}>Details</Link>
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    // Same height as a real card (photo plate, name, specs, price and buttons), so nothing jumps when products arrive.
    <div key={i} aria-hidden className="flex flex-col">
      <div className="plate h-52 animate-pulse" />
      <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-surface" />
      <div className="mt-2.5 h-7 w-2/3 animate-pulse rounded bg-surface" />
      <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-surface" />
      <div className="mt-4 h-[5.5rem] animate-pulse rounded bg-surface" />
      <div className="mt-4 h-[7.25rem] animate-pulse rounded bg-surface" />
    </div>
  ));
}
