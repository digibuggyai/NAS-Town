import { Link } from 'react-router';
import NasVisual from './NasVisual.jsx';
import { formatInr } from '../lib/api.js';
import { brandName } from '../data/site.js';

export default function ProductCard({ product: p }) {
  return (
    <article className="tilt glass liquid flex flex-col rounded-3xl p-5">
      <Link to={`/products/${p.slug}`} className="block rounded-2xl bg-white/[0.02] px-6 pt-6 pb-2">
        <NasVisual bays={p.bays} className="mx-auto h-40 w-auto" />
      </Link>
      <div className="mt-5 flex items-center justify-between text-xs">
        <span className="eyebrow !text-[0.65rem]">{brandName(p.brand)}</span>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-muted ring-1 ring-white/10">{p.bays}-bay</span>
      </div>
      <h3 className="mt-2 text-base font-medium leading-snug">{p.model}</h3>
      <p className="mt-1 text-sm text-muted">{p.key_spec}</p>
      <p className="mt-auto pt-4 text-xl font-semibold">{formatInr(p.price_inr)}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link to={`/products/${p.slug}`} className="btn btn-glass !px-3 !py-2.5 !text-sm">View Details</Link>
        <Link to={`/tools/configurator?model=${p.slug}`} className="btn btn-primary !px-3 !py-2.5 !text-sm">Configure</Link>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="glass h-[420px] animate-pulse rounded-3xl" />
  ));
}
