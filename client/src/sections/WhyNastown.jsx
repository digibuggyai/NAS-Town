import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { why } from '../data/home.js';

// Each promise is followed by a concrete fact, so it reads as a commitment rather than a slogan.
export default function WhyNastown() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={why.eyebrow} title={why.title}>
          {why.body.map((p) => <p key={p}>{p}</p>)}
        </SectionHeading>
        <Link to="/services" className="link inline-flex items-center gap-2 text-[0.95rem]">
          {why.cta} <ArrowRight className="size-4" />
        </Link>
      </div>

      <ol className="mt-10 grid gap-x-8 border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        {why.points.map(({ key, title, body, fact }, i) => (
          <Reveal as="li" key={key} delay={i * 60} className="flex flex-col border-b border-line py-6 lg:border-b-0">
            <span className="mono text-xs text-subtle">0{i + 1}</span>
            <h3 className="mt-3 text-lg">{title}</h3>
            <p className="mt-2 text-[0.95rem] text-muted">{body}</p>
            <div className="mt-auto pt-5">
              <p className="mono border-l-2 border-led pl-3 text-xs leading-relaxed text-fg">{fact}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
