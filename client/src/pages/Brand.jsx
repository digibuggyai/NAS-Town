import { Link, useParams } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { useProducts } from '../lib/hooks.js';
import { brands } from '../data/site.js';
import NotFound from './NotFound.jsx';

export default function Brand() {
  const { slug } = useParams();
  const b = brands.find((x) => x.slug === slug);
  const { data, loading } = useProducts(b ? { brand: b.filter } : undefined);
  if (!b) return <NotFound />;

  return (
    <>
      <title>{`${b.name} NAS | NASTOWN`}</title>
      <PageHero eyebrow={`Brands · ${b.name}`} title={b.h1} intro={b.intro}>
        <Link to="/services/installation" className="btn btn-primary">Get It Installed</Link>
        <Link to="/finder" className="btn btn-glass">Find My NAS</Link>
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
      <FinalCta />
    </>
  );
}
