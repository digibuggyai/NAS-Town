import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import MiniDiagram from '../components/MiniDiagram.jsx';
import { whatIsNas } from '../data/home.js';

// "What is NAS?" in one compact row: four cards (store, protect, share, access), each with
// its small diagram, one headline, two lines and a link. It used to be four large photo rows.
export default function FeatureRows() {
  return (
    <section id="what-is-nas" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 md:py-16">
      <Reveal className="max-w-2xl">
        <p className="eyebrow mb-3">{whatIsNas.eyebrow}</p>
        <h2 className="h-section">{whatIsNas.title}</h2>
        <p className="mt-3 text-lg leading-relaxed">{whatIsNas.body[0]}</p>
      </Reveal>

      {/* Phones: one swipeable row. Tablets: 2 × 2. Desktop: one row of four. */}
      <ul data-lenis-prevent-wheel className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {whatIsNas.points.map((pt, i) => (
          <Reveal as="li" key={pt.key} delay={i * 70} className="flex w-[78%] shrink-0 snap-start flex-col rounded-2xl border border-line bg-raised p-5 sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-14 shrink-0 rounded-xl bg-surface p-1.5"><MiniDiagram kind={pt.key} /></div>
              <p className="eyebrow">{pt.title}</p>
            </div>
            <h3 className="mt-4 text-lg leading-snug font-semibold">{pt.headline}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{pt.body}</p>
            <Link to={pt.link.to} className="link mt-auto inline-flex items-center gap-1 pt-4 text-sm">
              {pt.link.label} <ChevronRight className="size-4" />
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
