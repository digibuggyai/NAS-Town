import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
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
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.slug} delay={(i % 3) * 70}>
              <Link to={`/services/${s.slug}`} className="tilt glass liquid group flex h-full flex-col rounded-3xl p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
                    <Icon className="size-5 text-accent" />
                  </span>
                  {s.price && <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.7rem] text-white/80">{s.price}</span>}
                </div>
                <h2 className="mt-8 text-xl font-medium">{s.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.intro}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm text-white/70 transition-colors group-hover:text-white">
                  Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </section>
      <FinalCta />
    </>
  );
}
