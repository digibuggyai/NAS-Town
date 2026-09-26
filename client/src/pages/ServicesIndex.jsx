import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { services } from '../data/site.js';
import { why } from '../data/home.js';

export default function ServicesIndex() {
  return (
    <>
      <title>NAS Services | NASTOWN</title>
      <PageHero eyebrow="NAS Services" title="NAS Installation, Migration & Support" intro={why.body.join(' ')} />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28">
        <Reveal as="ul" className="rule-list border-y border-line">
          {services.map((s, i) => (
            <li key={s.slug}>
              <Link
                to={`/services/${s.slug}`}
                className="group grid gap-x-8 gap-y-1 py-6 transition-colors hover:bg-surface sm:grid-cols-[3rem_1fr_1.5fr_auto] sm:items-baseline sm:px-3"
              >
                <span className="mono hidden text-xs text-subtle sm:block">0{i + 1}</span>
                <div>
                  <h2 className="text-xl sm:text-2xl">{s.name}</h2>
                  {s.price && <p className="mono mt-1 text-xs text-accent">{s.price}</p>}
                </div>
                <p className="max-w-lg text-[0.95rem] text-muted">{s.intro}</p>
                <ArrowUpRight className="mt-2 size-5 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg sm:mt-0" aria-hidden />
              </Link>
            </li>
          ))}
        </Reveal>
      </section>
      <FinalCta />
    </>
  );
}
