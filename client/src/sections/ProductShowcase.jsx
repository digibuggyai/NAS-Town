import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import ProductCard, { ProductGridSkeleton } from '../components/ProductCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useProducts } from '../lib/hooks.js';
import { featured } from '../data/home.js';

// Shows the models marked "Featured" in the admin price manager, on a tonal band like a catalogue spread.
export default function ProductShowcase() {
  const { data, error, loading } = useProducts({ featured: true });
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={featured.eyebrow} title={featured.title}><p>{featured.body}</p></SectionHeading>
          <Link to="/products" className="link inline-flex items-center gap-2 text-[0.95rem]">
            {featured.cta} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <ProductGridSkeleton count={3} />}
          {error && <p className="col-span-full text-muted">Products can't be loaded right now. Please refresh in a moment.</p>}
          {data?.slice(0, 6).map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </div>
    </section>
  );
}
