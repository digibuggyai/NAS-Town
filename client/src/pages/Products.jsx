import { useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { useProducts } from '../lib/hooks.js';
import { brandName } from '../data/site.js';

const segments = [['all', 'All'], ['home', 'Home'], ['creator', 'Creator'], ['business', 'Business'], ['enterprise', 'Enterprise']];

export default function Products() {
  const { data, error, loading } = useProducts();
  const [brand, setBrand] = useState('all');
  const [segment, setSegment] = useState('all');
  const brandsInData = [...new Set((data ?? []).map((p) => p.brand))];
  const list = (data ?? []).filter((p) => (brand === 'all' || p.brand === brand) && (segment === 'all' || p.segment === segment));

  return (
    <>
      <title>NAS Products | NASTOWN</title>
      <PageHero
        eyebrow="NAS Products"
        title="NAS Products for Every Scale of Storage"
        intro="From compact 2-bay home NAS units to high-throughput rackmount systems for enterprise workloads, our product range covers every storage need. Compare RAID support, drive bays, RAM, and network speeds to find a system that fits your workflow, whether that's media editing, business backups, or 24/7 surveillance recording."
      />
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="glass flex flex-col gap-4 rounded-3xl p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Brand">
            <button className="chip" aria-pressed={brand === 'all'} onClick={() => setBrand('all')}>All brands</button>
            {brandsInData.map((b) => (
              <button key={b} className="chip" aria-pressed={brand === b} onClick={() => setBrand(b)}>{brandName(b)}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Use">
            {segments.map(([v, l]) => (
              <button key={v} className="chip" aria-pressed={segment === v} onClick={() => setSegment(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading && <ProductGridSkeleton count={8} />}
          {error && <p className="col-span-full text-muted">Products are unavailable right now. Please try again shortly.</p>}
          {list.map((p) => <ProductCard key={p.slug} product={p} />)}
          {data && list.length === 0 && <p className="col-span-full py-16 text-center text-muted">No systems match those filters yet.</p>}
        </div>
        <p className="mt-6 text-xs text-subtle">Diskless unit prices, GST inclusive. Add drives, installation and AMC in the configurator for a complete quote.</p>
      </section>
      <FinalCta />
    </>
  );
}
