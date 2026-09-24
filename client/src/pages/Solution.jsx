import { Link, useParams } from 'react-router';
import { Check } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { useProducts } from '../lib/hooks.js';
import { solutions } from '../data/site.js';
import NotFound from './NotFound.jsx';

export default function Solution() {
  const { slug } = useParams();
  const s = solutions.find((x) => x.slug === slug);
  const { data } = useProducts();
  if (!s) return <NotFound />;
  const Icon = s.icon;
  const picks = (data ?? []).filter((p) => p.use_cases.includes(s.useCase)).slice(0, 4);

  return (
    <>
      <title>{`NAS for ${s.name} | NASTOWN`}</title>
      <PageHero
        eyebrow={`Solutions · NAS for ${s.name}`}
        title={s.h1}
        intro={s.intro}
        aside={
          <div className="glass liquid rounded-[2rem] p-8">
            <Icon className="size-8 text-accent" />
            <ul className="mt-6 grid gap-4">
              {s.points.map((pt) => (
                <li key={pt} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-accent" /> <span>{pt}</span></li>
              ))}
            </ul>
          </div>
        }
      >
        <Link to="/finder" className="btn btn-primary">Find My NAS</Link>
        <Link to="/tools/configurator" className="btn btn-glass">Build My NAS</Link>
      </PageHero>

      {picks.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal><h2 className="text-2xl font-semibold">Recommended for {s.name.toLowerCase()}</h2></Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {picks.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="eyebrow mb-5">Other solutions</p>
        <div className="flex flex-wrap gap-2">
          {solutions.filter((x) => x.slug !== s.slug).map((x) => (
            <Link key={x.slug} to={`/solutions/${x.slug}`} className="chip">NAS for {x.name}</Link>
          ))}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
