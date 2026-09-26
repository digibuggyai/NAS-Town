import { Link, useSearchParams } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { useProducts } from '../lib/hooks.js';
import { brandName } from '../data/site.js';

// Size filters, in the URL so the navbar and footer can link straight to them.
const SIZES = [
  ['all', 'All sizes', () => true],
  ['2', '2-Bay', (p) => p.bays === 2],
  ['4', '4-Bay', (p) => p.bays === 4],
  ['5', '5-Bay', (p) => p.bays === 5],
  ['6-8', '6/8-Bay', (p) => p.bays >= 6],
];

export default function Products() {
  const { data, error, loading } = useProducts();
  const [params, setParams] = useSearchParams();
  const bays = params.get('bays') ?? 'all';
  const brand = params.get('brand') ?? 'all';
  const rackmount = params.get('type') === 'rackmount';

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    next.delete('type');
    if (value === 'all') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  };

  const sizeTest = SIZES.find(([k]) => k === bays)?.[2] ?? (() => true);
  const brands = [...new Set((data ?? []).map((p) => p.brand))];
  const list = rackmount ? [] : (data ?? []).filter((p) => sizeTest(p) && (brand === 'all' || p.brand === brand));

  return (
    <>
      <title>NAS Products | NASTOWN</title>
      <PageHero
        eyebrow="NAS Products"
        title="NAS Products for Every Scale of Storage"
        intro="From compact 2-bay home NAS units to high-throughput rackmount systems for enterprise workloads, our product range covers every storage need. Compare RAID support, drive bays, RAM, and network speeds to find a system that fits your workflow, whether that's media editing, business backups, or 24/7 surveillance recording."
      />
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="glass flex flex-col gap-4 rounded-xl p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Size">
            {SIZES.map(([k, label]) => (
              <button key={k} className="chip" aria-pressed={!rackmount && bays === k} onClick={() => setFilter('bays', k)}>{label}</button>
            ))}
            <button className="chip" aria-pressed={rackmount} onClick={() => setParams({ type: 'rackmount' }, { replace: true })}>Rackmount</button>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Brand">
            <button className="chip" aria-pressed={brand === 'all'} onClick={() => setFilter('brand', 'all')}>All brands</button>
            {brands.map((b) => (
              <button key={b} className="chip" aria-pressed={brand === b} onClick={() => setFilter('brand', b)}>{brandName(b)}</button>
            ))}
          </div>
        </div>

        {rackmount ? (
          <div className="glass mt-8 rounded-xl p-8 text-center">
            <h2 className="text-xl font-medium">Rackmount NAS, on request</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Rackmount systems are specified for each deployment. Tell us your capacity, rack space and workload and we'll quote the right unit.
            </p>
            <Link to="/about#contact" className="btn btn-primary mt-6">Talk to an Expert</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading && <ProductGridSkeleton count={8} />}
            {error && <p className="col-span-full text-muted">Products are unavailable right now. Please try again shortly.</p>}
            {list.map((p) => <ProductCard key={p.slug} product={p} />)}
            {data && list.length === 0 && <p className="col-span-full py-16 text-center text-muted">No systems match those filters yet.</p>}
          </div>
        )}
        <p className="mt-6 text-xs text-subtle">Diskless unit prices, GST inclusive. Add drives, installation and AMC in the configurator for a complete quote.</p>
      </section>
      <FinalCta />
    </>
  );
}
