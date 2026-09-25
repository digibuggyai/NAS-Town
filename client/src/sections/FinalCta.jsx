import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import { finalCta } from '../data/home.js';

export default function FinalCta({ eyebrow = finalCta.eyebrow, title = finalCta.title, body = finalCta.body }) {
  const lines = Array.isArray(body) ? body : [body];
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <Reveal>
        <div className="glass liquid relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center sm:px-12 sm:py-28">
          <div className="absolute -top-1/2 left-1/2 h-full w-2/3 -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" />
          {eyebrow && <p className="eyebrow relative mb-5">{eyebrow}</p>}
          <SplitHeading text={title} className="relative text-3xl sm:text-5xl" />
          <div className="relative mx-auto mt-6 max-w-xl space-y-1 text-base text-muted">
            {lines.map((l) => <p key={l}>{l}</p>)}
          </div>
          <div className="relative mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/finder" className="magnetic btn btn-primary">Find My NAS <ArrowRight className="size-4" /></Link>
            <Link to="/about#contact" className="magnetic btn btn-glass">Talk to an Expert</Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
