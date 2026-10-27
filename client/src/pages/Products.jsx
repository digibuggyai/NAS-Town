import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, MessageCircle, SlidersHorizontal, X } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import Button from '../components/Button.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { useProducts } from '../lib/hooks.js';
import { usePricing } from '../lib/nas/usePricing.js';
import { SORTS, applyFilters, filterGroups, readFilters } from '../lib/productFilters.js';
import { lockScroll } from '../lib/motion.js';
import { waLink } from '../data/site.js';
import Seo from '../components/Seo.jsx';
import ConfiguratorBand from '../components/ConfiguratorBand.jsx';

/** One group of single-choice chips; choosing the active one again clears it. */
function Group({ group, value, onPick }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3 !text-xs">{group.title}</legend>
      <div className="flex flex-wrap gap-2">
        {group.options.map(([v, label]) => (
          <button key={v} type="button" className="chip !min-h-10 !px-3.5 !text-[0.8125rem]" aria-pressed={value === v} onClick={() => onPick(group.key, value === v ? null : v)}>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function Products() {
  const { data, error, loading } = useProducts({ page: 'products' }); // placement set in Admin → Product pages
  const { pricing } = usePricing('public'); // largest drive we sell, for "storage you need"
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    lockScroll(sheet);
    if (!sheet) return;
    const onKey = (e) => e.key === 'Escape' && setSheet(false);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); lockScroll(false); };
  }, [sheet]);

  const f = readFilters(params);
  const products = data ?? [];
  const groups = useMemo(() => filterGroups(products), [products]);
  const largestDrive = pricing ? Math.max(...pricing.capacities) : null;
  const list = useMemo(() => applyFilters(products, f, largestDrive), [products, params, largestDrive]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    next.delete('type'); // the old rackmount link becomes ?bays=rackmount once anything changes
    if (f.bays === 'rackmount' && key !== 'bays') next.set('bays', 'rackmount');
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const clearAll = () => setParams(f.sort ? { sort: f.sort } : {}, { replace: true, preventScrollReset: true });

  const active = groups.flatMap((g) => (f[g.key] ? [{ key: g.key, label: g.options.find(([v]) => v === f[g.key])?.[1] ?? f[g.key] }] : []));
  const panel = groups.map((g) => <Group key={g.key} group={g} value={f[g.key]} onPick={set} />);

  return (
    <>
      <Seo />
      <PageHero
        eyebrow="NAS Products"
        title="NAS Products for Every Scale of Storage"
        intro="From compact 2-bay home NAS units to high-throughput systems for enterprise workloads. Filter by bays, brand, the storage you need, use case, network speed and price, then configure the one you like with drives and installation."
      />
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[15rem_1fr] xl:grid-cols-[16.5rem_1fr]">
          {/* Desktop: filters in a sidebar */}
          <aside aria-label="Filters" className="hidden lg:block">
            <div className="sticky top-24 grid max-h-[calc(100svh-7rem)] gap-6 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-raised p-5">{panel}</div>
          </aside>

          <div className="min-w-0">
            {/* Results bar: count, active filters, sort, and the phone's filter button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted" aria-live="polite">
                {data ? <><span className="font-medium text-fg">{list.length}</span> of {products.length} NAS units</> : ' '}
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setSheet(true)} className="btn btn-secondary btn-sm lg:hidden">
                  <SlidersHorizontal className="size-4" /> Filters{active.length > 0 && ` (${active.length})`}
                </button>
                <label className="flex items-center gap-2 text-sm">
                  <span className="sr-only sm:not-sr-only sm:text-muted">Sort</span>
                  <select value={f.sort ?? ''} onChange={(e) => set('sort', e.target.value || null)} className="field !min-h-11 !w-auto !py-2 !text-sm">
                    {SORTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {active.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {active.map((a) => (
                  <button key={a.key} type="button" onClick={() => set(a.key, null)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-accent-soft py-1 pr-2.5 pl-3 text-sm text-accent-strong hover:bg-accent hover:text-white" aria-label={`Remove filter: ${a.label}`}>
                    {a.label} <X className="size-3.5" aria-hidden />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="ml-1 min-h-9 px-1 text-sm text-muted underline-offset-4 hover:text-fg hover:underline">Clear all</button>
              </div>
            )}

            {/* Capacity pages have full builds with drives and prices: point there. */}
            {f.cap && (
              <Link to={`/nas/${f.cap}tb`} className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm ring-1 ring-line hover:ring-accent/40">
                <span>See complete <strong>{f.cap} TB</strong> builds with drives, RAID and prices</span>
                <ArrowRight className="size-4 shrink-0 text-accent" aria-hidden />
              </Link>
            )}

            <h2 className="sr-only">NAS units</h2>
            <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {loading && <ProductGridSkeleton count={6} />}
              {error && <p className="col-span-full text-muted">Products are unavailable right now. Please try again shortly.</p>}
              {list.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>

            {data && list.length === 0 && (
              <div className="glass mt-2 rounded-xl p-8 text-center">
                <h2 className="text-xl font-medium">{f.bays === 'rackmount' ? 'Rackmount NAS, specified for you' : 'Nothing listed matches all of that'}</h2>
                <p className="mx-auto mt-2 max-w-md text-muted">
                  {f.bays === 'rackmount'
                    ? "Rackmount systems are specified for each deployment. Tell us your capacity, rack space and workload and we'll quote the right unit."
                    : "We can often still supply it, or suggest something close. Tell us what you need, or loosen a filter."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button variant="whatsapp" href={waLink(`Hi NASTOWN, I'm looking for a NAS: ${active.map((a) => a.label).join(', ') || 'help choosing'}.`)}>
                    <MessageCircle className="size-4" /> Talk to us
                  </Button>
                  {active.length > 0 && <Button variant="secondary" onClick={clearAll}>Clear all filters</Button>}
                </div>
              </div>
            )}
            <p className="mt-8 text-xs text-subtle">Diskless unit prices, GST inclusive. Add drives, installation and AMC in the configurator for a complete quote.</p>
          </div>
        </div>
      </section>

      {/* Phone: filters in a bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" onClick={() => setSheet(false)} className="absolute inset-0 bg-fg/40" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-3xl bg-raised shadow-[0_-16px_40px_-16px_rgb(15_23_42/0.35)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="font-medium">Filters</p>
              <button type="button" onClick={() => setSheet(false)} aria-label="Close" className="grid size-11 place-items-center rounded-full hover:bg-surface"><X className="size-5" /></button>
            </div>
            <div className="grid gap-6 overflow-y-auto overscroll-contain px-5 py-5">{panel}</div>
            <div className="flex gap-2 border-t border-line px-5 py-3">
              <Button variant="secondary" onClick={clearAll} className="flex-1">Clear all</Button>
              <Button onClick={() => setSheet(false)} className="flex-1">Show {list.length} {list.length === 1 ? 'result' : 'results'}</Button>
            </div>
          </div>
        </div>
      )}
      <ConfiguratorBand className="pb-16" title="Know your size, not the model?" body="Tell the configurator how much storage you need. It picks the unit, drives and RAID level and prices it with GST." />
      <FinalCta />
    </>
  );
}
