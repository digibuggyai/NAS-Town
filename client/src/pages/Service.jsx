import { Link, useParams } from 'react-router';
import { Check } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Reveal from '../components/Reveal.jsx';
import { services } from '../data/site.js';
import NotFound from './NotFound.jsx';

export default function Service() {
  const { slug } = useParams();
  const s = services.find((x) => x.slug === slug);
  if (!s) return <NotFound />;
  const Icon = s.icon;

  return (
    <>
      <title>{`${s.name} | NASTOWN Services`}</title>
      <PageHero
        eyebrow={`Services · ${s.name}`}
        title={s.h1}
        intro={s.intro}
        aside={
          <div className="glass liquid rounded-[2rem] p-8">
            <div className="flex items-center justify-between">
              <Icon className="size-8 text-accent" />
              {s.price && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">{s.price}</span>}
            </div>
            <p className="eyebrow mt-8 mb-4">What's included</p>
            <ul className="grid gap-4">
              {s.includes.map((i) => (
                <li key={i} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-accent" /> {i}</li>
              ))}
            </ul>
          </div>
        }
      >
        <a href="#book" className="btn btn-primary">Book {s.name}</a>
      </PageHero>

      <section id="book" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-16 sm:px-6">
        <EnquiryForm type="service" title={`Book ${s.name}`} payload={{ service: s.slug }} submitLabel="Request Service" />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <p className="eyebrow mb-5">All services</p>
          <div className="flex flex-wrap gap-2">
            {services.map((x) => (
              <Link key={x.slug} to={`/services/${x.slug}`} className="chip" aria-pressed={x.slug === s.slug}>{x.name}</Link>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
