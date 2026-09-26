import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { solutions } from '../data/home.js';

// An index, not a card grid: six options read faster as rows you can scan down.
export default function Solutions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={solutions.eyebrow} title={solutions.title}>
          {solutions.body.map((p) => <p key={p}>{p}</p>)}
        </SectionHeading>
        <Link to="/solutions" className="link inline-flex items-center gap-2 text-[0.95rem]">
          {solutions.cta} <ArrowRight className="size-4" />
        </Link>
      </div>

      <Reveal as="ul" delay={100} className="rule-list mt-12 border-y border-line">
        {solutions.cards.map(({ slug, title, body, cta }, i) => (
          <li key={slug}>
            <Link
              to={`/solutions/${slug}`}
              className="group grid gap-x-8 gap-y-1 py-6 transition-colors hover:bg-surface sm:grid-cols-[3rem_1fr_1.5fr_auto] sm:items-baseline sm:px-3"
            >
              <span className="mono hidden text-xs text-subtle sm:block">0{i + 1}</span>
              <h3 className="text-xl sm:text-2xl">{title}</h3>
              <p className="max-w-lg text-[0.95rem] text-muted">{body}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted transition-colors group-hover:text-fg sm:mt-0">
                <span className="sm:sr-only">{cta}</span>
                <ArrowUpRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
