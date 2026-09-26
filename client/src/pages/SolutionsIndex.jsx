import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { solutions } from '../data/site.js';
import { solutions as home } from '../data/home.js';

export default function SolutionsIndex() {
  return (
    <>
      <title>NAS Solutions | NASTOWN</title>
      <PageHero eyebrow={home.eyebrow} title="NAS for the Way You Work" intro={home.body.join(' ')} />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28">
        <Reveal as="ul" className="rule-list border-y border-line">
          {solutions.map((s, i) => {
            const card = home.cards.find((c) => c.slug === s.slug);
            return (
              <li key={s.slug}>
                <Link
                  to={`/solutions/${s.slug}`}
                  className="group grid gap-x-8 gap-y-1 py-6 transition-colors hover:bg-surface sm:grid-cols-[3rem_1fr_1.5fr_auto] sm:items-baseline sm:px-3"
                >
                  <span className="mono hidden text-xs text-subtle sm:block">0{i + 1}</span>
                  <h2 className="text-xl sm:text-2xl">NAS for {s.name}</h2>
                  <p className="max-w-lg text-[0.95rem] text-muted">{card?.body ?? s.intro}</p>
                  <ArrowUpRight className="mt-2 size-5 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg sm:mt-0" aria-hidden />
                </Link>
              </li>
            );
          })}
        </Reveal>
      </section>
      <FinalCta />
    </>
  );
}
