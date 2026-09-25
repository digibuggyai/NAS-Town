import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { solutions as solutionData } from '../data/site.js';
import { solutions } from '../data/home.js';

const iconFor = (slug) => solutionData.find((s) => s.slug === slug)?.icon;

export default function Solutions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeading eyebrow={solutions.eyebrow} title={solutions.title}>
        {solutions.body.map((p) => <span key={p} className="block [&+&]:mt-2">{p}</span>)}
      </SectionHeading>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.cards.map(({ slug, title, body, cta }, i) => {
          const Icon = iconFor(slug);
          return (
            <Reveal key={slug} delay={(i % 3) * 70}>
              <Link to={`/solutions/${slug}`} className="tilt glass liquid group flex h-full flex-col rounded-3xl p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
                  {Icon && <Icon className="size-5 text-accent" />}
                </span>
                <h3 className="mt-8 text-xl font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm text-white/70 transition-colors group-hover:text-white">
                  {cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
      <div className="mt-12 text-center">
        <Link to="/solutions" className="magnetic btn btn-glass">{solutions.cta} <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}
