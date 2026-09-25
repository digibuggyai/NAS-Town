import { Link } from 'react-router';
import { ArrowRight, Check } from 'lucide-react';
import NasVisual from './NasVisual.jsx';
import { formatInr } from '../lib/api.js';
import { brandName } from '../data/site.js';

/** Up to three short, factual highlights read off the spec. */
function keyFeatures(p) {
  const top = Math.max(0, ...[...String(p.network ?? '').matchAll(/(\d+(?:\.\d+)?)\s*GbE/gi)].map((m) => Number(m[1])));
  return [
    p.cpu,
    top >= 10 ? '10GbE networking' : top >= 2.5 ? '2.5GbE networking' : '1GbE networking',
    p.m2_slots ? `${p.m2_slots} × M.2 NVMe slots` : null,
    p.expandable && p.bays_with_expansion ? `Expands to ${p.bays_with_expansion} bays` : null,
  ].filter(Boolean).slice(0, 3);
}

export default function ProductCard({ product: p }) {
  const bestFor = (p.best_for ?? '').split('•').map((s) => s.trim()).filter(Boolean);
  return (
    <article className="tilt glass liquid flex flex-col rounded-3xl p-5">
      <Link to={`/products/${p.slug}`} className="block rounded-2xl bg-white/[0.02] px-6 pt-6 pb-2">
        <NasVisual bays={p.bays} className="mx-auto h-36 w-auto" />
      </Link>
      <p className="eyebrow mt-5 !text-[0.62rem]">{brandName(p.brand)}</p>
      <h3 className="mt-2 text-lg font-medium leading-snug">{p.model}</h3>
      <p className="text-sm text-muted">{p.bays}-Bay NAS</p>

      {bestFor.length > 0 && (
        <div className="mt-4">
          <p className="text-[0.68rem] tracking-wide text-subtle uppercase">Best for</p>
          <p className="mt-1 text-sm text-white/85">{bestFor.join(' · ')}</p>
        </div>
      )}

      <ul className="mt-4 grid gap-1.5 text-sm text-muted">
        {keyFeatures(p).map((f) => (
          <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-accent" /> {f}</li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        {p.price_inr != null && (
          <>
            <p className="text-[0.68rem] tracking-wide text-subtle uppercase">Price (diskless, GST incl.)</p>
            <p className="mt-0.5 text-xl font-medium">{formatInr(p.price_inr)}</p>
          </>
        )}
        <Link to={`/products/${p.slug}`} className="btn btn-glass mt-4 w-full !py-2.5 !text-sm">
          View Details <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="glass h-[460px] animate-pulse rounded-3xl" />
  ));
}
