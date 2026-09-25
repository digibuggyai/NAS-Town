import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useProducts } from '../lib/hooks.js';

export default function ProductShowcase() {
  const { data, error, loading } = useProducts({ featured: true });
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeading eyebrow="Featured systems" title="Meet the *NAS.*">
        Carefully selected NAS systems from leading brands.
      </SectionHeading>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading && <ProductGridSkeleton />}
        {error && <p className="col-span-full text-center text-muted">Products are unavailable right now. Please try again shortly.</p>}
        {data?.slice(0, 4).map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
      <div className="mt-12 text-center">
        <Link to="/products" className="btn btn-glass">View All Products <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}
