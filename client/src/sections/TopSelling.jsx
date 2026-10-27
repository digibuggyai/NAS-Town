import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Check, SlidersHorizontal } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import ProductPhoto, { useTilt } from '../components/ProductPhoto.jsx';
import { api, formatInr } from '../lib/api.js';
import { preloaded } from '../lib/preload.js';
import { brandName } from '../data/site.js';

/* Our top-selling NAS: the models ticked "Featured" in Admin → Pricing, each with what makes it
 * sell (its summary) and three facts from its spec sheet. Hidden while nothing is featured. */

const PATH = '/products?featured=true';

/** Three short selling points from real specs. */
function usps(p) {
  const top = Math.max(0, ...[...String(p.network ?? '').matchAll(/(\d+(?:\.\d+)?)\s*GbE/gi)].map((m) => Number(m[1])));
  return [
    p.bays_with_expansion ? `${p.bays} bays, expands to ${p.bays_with_expansion}` : `${p.bays} drive bays`,
    top >= 2.5 ? `${top >= 10 ? '10' : '2.5'}GbE networking` : null,
    p.m2_slots ? `${p.m2_slots} × M.2 NVMe cache slots` : p.memory ? `${p.memory.split(' (')[0]} memory` : null,
  ].filter(Boolean);
}

function Card({ p, i }) {
  const { plateRef, handlers } = useTilt();
  return (
    <Reveal as="li" delay={i * 80} className="group relative flex flex-col rounded-2xl border border-line bg-raised p-5" {...handlers}>
      <span className="absolute top-4 left-4 z-10 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">Top seller</span>
      <div ref={plateRef} className="tilt grid h-48 place-items-center rounded-xl bg-surface px-6">
        <ProductPhoto model={p.shortModel ?? p.model} bays={p.bays} alt="" className="tilt-media h-36 w-full" />
      </div>
      <p className="eyebrow mt-5">{brandName(p.brand)} · {p.bays}-Bay NAS</p>
      <h3 className="mt-1 text-xl font-bold">
        <Link to={`/products/${p.slug}`} className="after:absolute after:inset-0">{p.model}</Link>
      </h3>
      {p.summary && <p className="mt-2 text-sm leading-relaxed text-muted">{p.summary}</p>}
      <ul className="mt-4 grid gap-1.5 text-sm">
        {usps(p).map((u) => (
          <li key={u} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />{u}</li>
        ))}
      </ul>
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        {p.price_inr != null && (
          <p>
            <span className="block text-xs text-subtle">Diskless · GST incl.</span>
            <span className="text-lg font-bold">{formatInr(p.price_inr)}</span>
          </p>
        )}
        <Link to={`/tools/configurator?model=${p.slug}`} className="btn btn-primary btn-sm relative z-10">
          <SlidersHorizontal className="size-3.5" aria-hidden /> Configure
        </Link>
      </div>
    </Reveal>
  );
}

export default function TopSelling() {
  const [items, setItems] = useState(() => preloaded(PATH) ?? null);
  useEffect(() => { api.products({ featured: 'true' }).then(setItems).catch(() => setItems([])); }, []);
  if (items && !items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Top selling NAS</p>
          <h2 className="h-section">What our customers buy most</h2>
        </div>
        <Link to="/products" className="link inline-flex items-center gap-1.5">All NAS products <ArrowRight className="size-4" /></Link>
      </Reveal>
      <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items
          ? items.slice(0, 3).map((p, i) => <Card key={p.slug} p={p} i={i} />)
          : [0, 1, 2].map((i) => <li key={i} aria-hidden className="h-[30rem] animate-pulse rounded-2xl bg-surface" />)}
      </ul>
    </section>
  );
}
