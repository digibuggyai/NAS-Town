import { Link, useParams } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { useProducts } from '../lib/hooks.js';
import { brands } from '../data/site.js';
import NotFound from './NotFound.jsx';
import Seo from '../components/Seo.jsx';
import ConfiguratorBand from '../components/ConfiguratorBand.jsx';

export default function Brand() {
  const { slug } = useParams();
  const b = brands.find((x) => x.slug === slug);
  const { data, loading } = useProducts(b ? { brand: b.filter, page: 'brand' } : undefined);
  if (!b) return <NotFound />;

  return (
    <>
      <Seo />
      <PageHero
        eyebrow={`Brands · ${b.name}`}
        title={b.h1}
        intro={b.intro}
        aside={b.logo && (
          <div className="grid h-48 place-items-center rounded-2xl border border-line bg-surface/70 px-10">
            <img src={b.logo.src} alt={`${b.name} logo`} width={b.logo.size[0]} height={b.logo.size[1]} className="h-14 w-auto max-w-full" />
          </div>
        )}
      >
        {/* Pre-set to this brand when we list its units; otherwise the open configurator. */}
        {data?.length
          ? <Link to={`/tools/configurator?brand=${b.filter}`} className="btn btn-primary">Configure your {b.name} NAS</Link>
          : <Link to="/tools/configurator" className="btn btn-primary">Build your NAS</Link>}
        <Link to="/services/installation" className="btn btn-secondary">Get it installed</Link>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="mb-8 flex flex-wrap gap-2">
          {brands.map((x) => (
            <Link key={x.slug} to={`/brands/${x.slug}`} className="chip" aria-pressed={x.slug === b.slug}>{x.name}</Link>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading && <ProductGridSkeleton />}
          {data?.map((p) => <ProductCard key={p.slug} product={p} />)}
          {data?.length === 0 && <p className="col-span-full py-10 text-muted">We're adding {b.name} systems soon. Ask our team for current availability.</p>}
        </div>
      </section>
      <ConfiguratorBand className="pb-16" title={`Price a ${b.name} NAS`} body={`Set your size and pick ${b.name} as the brand: the unit, drives, RAID level and a GST-inclusive total follow instantly.`} />
      <FinalCta />
    </>
  );
}
