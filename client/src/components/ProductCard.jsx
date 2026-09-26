import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import NasVisual from './NasVisual.jsx';
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
  return (
    <article className="group relative flex flex-col">
      <div className="plate border border-line bg-raised px-8 pt-8 pb-3 transition-colors group-hover:border-line-strong">
        <NasVisual bays={p.bays} className="mx-auto h-32 w-auto" />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="eyebrow">{brandName(p.brand)} · {p.bays}-Bay NAS</p>
        {p.expandable && <p className="mono text-[0.7rem] text-subtle">Expandable</p>}
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

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
        {p.price_inr != null ? (
          <p>
            <span className="mono block text-[0.7rem] text-subtle">Diskless · GST incl.</span>
            <span className="text-lg font-medium">{formatInr(p.price_inr)}</span>
          </p>
        ) : <span />}
        <span className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors group-hover:text-fg">
          View Details <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} aria-hidden className="flex flex-col gap-3">
      <div className="plate h-44 animate-pulse" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
      <div className="h-6 w-2/3 animate-pulse rounded bg-surface" />
      <div className="h-16 animate-pulse rounded bg-surface" />
    </div>
  ));
}
