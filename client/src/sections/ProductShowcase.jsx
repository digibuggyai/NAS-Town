import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useProducts } from '../lib/hooks.js';
import { featured } from '../data/home.js';

// Shows the models marked "Featured" in the admin price manager.
export default function ProductShowcase() {
  const { data, error, loading } = useProducts({ featured: true });
  return (
    <section className="mx-auto max-w-6xl px-4 py-28 sm:px-6">
      <SectionHeading eyebrow={featured.eyebrow} title={featured.title}>{featured.body}</SectionHeading>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <ProductGridSkeleton count={3} />}
        {error && <p className="col-span-full text-center text-muted">Products are unavailable right now. Please try again shortly.</p>}
        {data?.slice(0, 6).map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
      <div className="mt-12 text-center">
        <Link to="/products" className="magnetic btn btn-glass">{featured.cta} <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}
