import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { solutions } from '../data/home.js';

// A hairline grid, like a spec table: six options you can compare at a glance,
// each with the setup people usually start from.
export default function Solutions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={solutions.eyebrow} title={solutions.title}>
          {solutions.body.map((p) => <p key={p}>{p}</p>)}
        </SectionHeading>
        <Link to="/solutions" className="link inline-flex items-center gap-2 text-[0.95rem]">
          {solutions.cta} <ArrowRight className="size-4" />
        </Link>
      </div>

      <Reveal as="ul" delay={80} className="mt-10 grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {solutions.cards.map(({ slug, title, body, setup, cta, image, alt }) => (
          <li key={slug} className="border-b border-line sm:odd:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0">
            <Link to={`/solutions/${slug}`} aria-label={cta} className="group flex h-full flex-col py-5 transition-colors hover:bg-surface sm:p-6">
              {/* Photos are toned slightly toward the palette; full colour returns on hover. */}
              <div className="mb-5 aspect-[16/9] overflow-hidden rounded-md bg-surface sm:aspect-[4/3]">
                <img
                  src={image}
                  alt={alt}
                  width="800"
                  height="600"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover saturate-[.8] transition duration-500 ease-out group-hover:scale-[1.03] group-hover:saturate-100"
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl">
                  <span className="text-subtle">NAS for </span>{title}
                </h3>
                <ArrowUpRight className="mt-1 size-5 shrink-0 text-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg" />
              </div>
              <p className="mt-2 text-[0.95rem] text-muted">{body}</p>
              <p className="mono mt-auto pt-5 text-xs">
                <span className="text-subtle">Typical setup  </span>{setup}
              </p>
            </Link>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
