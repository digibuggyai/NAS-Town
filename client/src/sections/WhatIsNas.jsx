import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { whatIsNas } from '../data/home.js';

export default function WhatIsNas() {
  const [definition, second] = whatIsNas.body;
  const [term, rest] = definition.split(/ is (.+)/s); // "A NAS (Network Attached Storage)" / "a dedicated…"

  return (
    <section id="what-is-nas" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow mb-4">{whatIsNas.eyebrow}</p>
          <h2 className="h-section">{whatIsNas.title}</h2>
        </Reveal>
        <Reveal delay={100} className="measure">
          {/* Written like a definition, because that's what it is. */}
          <p className="text-xl leading-relaxed sm:text-[1.375rem]">
            <span className="font-semibold">{term}</span> is {rest}
          </p>
          {second && <p className="mt-5 text-muted">{second}</p>}
          <Link to="/resources/guides" className="link mt-6 inline-flex items-center gap-2 text-[0.95rem]">
            {whatIsNas.cta} <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>

      <Reveal as="ol" delay={150} className="mt-12 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        {whatIsNas.points.map(({ key, title, body }, i) => (
          <li
            key={key}
            className={`border-line py-6 sm:pr-6 lg:py-8 ${i > 0 ? 'border-t sm:border-t-0' : ''} ${i % 2 === 1 ? 'sm:border-l sm:pl-6' : ''} ${i >= 2 ? 'sm:border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l lg:pl-6' : ''}`}
          >
            <span className="mono text-xs text-subtle">0{i + 1}</span>
            <h3 className="mt-3 text-xl">{title}</h3>
            <p className="mt-2 text-[0.95rem] text-muted">{body}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
