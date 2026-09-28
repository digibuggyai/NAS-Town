import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { solutions } from '../data/home.js';

// Use cases as photo cards: rounded image, heading, one line, typical setup, blue link.
export default function Solutions() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">{solutions.eyebrow}</p>
            <h2 className="h-section">{solutions.title}</h2>
            {solutions.body.map((p) => <p key={p} className="mt-4 text-lg leading-relaxed">{p}</p>)}
          </div>
          <Link to="/solutions" className="link inline-flex items-center gap-1">
            {solutions.cta} <ChevronRight className="size-4" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.cards.map(({ slug, title, body, setup, cta, image, alt }, i) => (
            <Reveal key={slug} delay={(i % 3) * 80}>
              <Link to={`/solutions/${slug}`} className="group block">
                <div className="overflow-hidden rounded-[20px] bg-white">
                  <img
                    src={image}
                    alt={alt}
                    width="800"
                    height="600"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <h3 className="mt-5 text-xl">NAS for {title}</h3>
                <p className="mt-2 leading-relaxed">{body}</p>
                <p className="mono mt-3 text-sm text-subtle">
                  <span className="font-medium text-muted">Typical setup:</span> {setup}
                </p>
                <span className="link mt-4 inline-flex items-center gap-1">
                  {cta} <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
