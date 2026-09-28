import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import MiniDiagram from '../components/MiniDiagram.jsx';
import { whatIsNas } from '../data/home.js';

// "What is NAS?" as alternating feature rows: framed photo with a floating diagram
// card on one side, the story and a blue link on the other, a pastel wash behind.
export default function FeatureRows() {
  return (
    <section id="what-is-nas" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 md:py-20">
      <Reveal className="max-w-2xl">
        <p className="eyebrow mb-3">{whatIsNas.eyebrow}</p>
        <h2 className="h-section">{whatIsNas.title}</h2>
        <p className="mt-4 text-lg leading-relaxed">{whatIsNas.body[0]}</p>
      </Reveal>

      <div className="mt-6 grid gap-20 md:mt-10 md:gap-28">
        {whatIsNas.points.map((pt, i) => {
          const imageFirst = i % 2 === 0;
          return (
            <div key={pt.key} className="relative grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
              {/* Photo + overlapping diagram card */}
              <Reveal className={`relative mx-auto w-full max-w-[480px] ${imageFirst ? '' : 'md:order-2'}`}>
                <div className="frame">
                  <img
                    src={pt.image}
                    alt={pt.alt}
                    width="900"
                    height="900"
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full rounded-[28px] object-cover"
                  />
                </div>
                <div
                  className={`float-card absolute top-[30%] w-[40%] min-w-32 p-4 ${
                    imageFirst ? 'right-0 md:-right-14 lg:-right-20' : 'left-0 md:-left-14 lg:-left-20'
                  }`}
                >
                  <MiniDiagram kind={pt.key} />
                </div>
              </Reveal>

              {/* Story */}
              <Reveal delay={100} className={`relative ${imageFirst ? '' : 'md:order-1'}`}>
                <div className="wash -inset-10 -z-10" aria-hidden />
                <p className="eyebrow">{pt.title}</p>
                <h3 className="h-section mt-3">{pt.headline}</h3>
                <p className="mt-5 max-w-xl leading-relaxed">{pt.body}</p>
                <Link to={pt.link.to} className="link mt-7 inline-flex items-center gap-1">
                  {pt.link.label} <ChevronRight className="size-4" />
                </Link>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}
