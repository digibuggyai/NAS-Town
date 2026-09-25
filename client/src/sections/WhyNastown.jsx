import { Link } from 'react-router';
import { ArrowRight, Compass, Layers, LifeBuoy, Wrench } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { why } from '../data/home.js';

const ICONS = { guidance: Compass, install: Wrench, brands: Layers, support: LifeBuoy };

export default function WhyNastown() {
  return (
    <section className="relative bg-gradient-to-b from-transparent via-ink-2/80 to-transparent py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={why.eyebrow} title={why.title}>
          {why.body.map((p) => <span key={p} className="block [&+&]:mt-2">{p}</span>)}
        </SectionHeading>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {why.points.map(({ key, title, body }, i) => {
            const Icon = ICONS[key];
            return (
              <Reveal key={key} delay={i * 70}>
                <div className="tilt glass liquid flex h-full flex-col rounded-3xl p-7">
                  <span className="font-mono text-xs text-subtle">0{i + 1}</span>
                  <Icon className="mt-8 size-7 text-accent" strokeWidth={1.6} />
                  <h3 className="mt-5 text-lg font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Link to="/services" className="magnetic btn btn-glass">{why.cta} <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
