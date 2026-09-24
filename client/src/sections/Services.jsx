import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { services } from '../data/site.js';

export default function Services() {
  return (
    <section className="relative bg-gradient-to-b from-transparent via-ink-2/80 to-transparent py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="NAS care & support" title="We Stay After the Sale.">
          Your NAS is not a one-time purchase. It is part of your data infrastructure. From installation and migration to
          repair, upgrades and maintenance, NASTOWN helps keep your storage running smoothly.
        </SectionHeading>
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ slug, name, icon: Icon, price }, i) => (
            <Reveal key={slug} delay={(i % 3) * 60}>
              <Link to={`/services/${slug}`} className="glass liquid group flex h-full items-center gap-4 rounded-2xl p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
                  <Icon className="size-5 text-accent" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{name}</p>
                  {price && <p className="mt-0.5 text-xs text-muted">{price}</p>}
                </div>
                <ArrowRight className="size-4 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/services/installation" className="btn btn-glass">Explore Services <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
