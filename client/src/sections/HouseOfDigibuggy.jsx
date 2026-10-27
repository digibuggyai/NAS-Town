import { Link } from 'react-router';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { groupBrands, parentCompany } from '../config/siteContent.js';

/** The DigiBuggy group: one card per brand. A brand missing its description or link
 *  (AVS, until confirmed) is left out rather than guessed. */
export default function HouseOfDigibuggy() {
  const brands = groupBrands.filter((b) => b.description && b.url);
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <Reveal className="max-w-2xl">
        <p className="eyebrow mb-3">House of {parentCompany.name}</p>
        <h2 className="h-section">Part of a bigger family</h2>
        <p className="mt-4 text-lg leading-relaxed">
          NASTOWN is a {parentCompany.name} ({parentCompany.alsoKnownAs}) company, based in Nehru Place, New Delhi. The same group, the same people behind it.
        </p>
      </Reveal>
      <ul className={`mt-10 grid gap-5 sm:grid-cols-2 ${brands.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {brands.map((b, i) => {
          const inner = (
            <>
              <div className="flex h-12 items-center justify-between gap-3">
                {b.logo ? (
                  <span className={b.logoOnDark ? 'rounded-lg bg-fg px-3 py-2' : ''}>
                    <img src={b.logo} alt="" loading="lazy" decoding="async" className={b.logoOnDark ? 'h-4 w-auto' : 'h-10 w-auto'} />
                  </span>
                ) : (
                  <span className="font-display text-xl font-semibold tracking-tight">{b.name}</span>
                )}
                {b.current
                  ? <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong"><MapPin className="size-3" aria-hidden /> You are here</span>
                  : <ArrowUpRight className="size-5 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" aria-hidden />}
              </div>
              <h3 className="mt-5 text-lg font-bold">{b.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.description}</p>
              {!b.current && <p className="mt-3 text-sm text-accent">{b.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>}
            </>
          );
          const cls = `group flex h-full flex-col rounded-2xl border bg-raised p-6 transition-[border-color,box-shadow] duration-300 ${b.current ? 'border-accent/40' : 'border-line hover:border-accent/40 hover:shadow-[0_14px_30px_-18px_rgb(15_23_42/0.35)]'}`;
          return (
            <Reveal as="li" key={b.key} delay={i * 80}>
              {b.current
                ? <Link to={b.url} className={cls} aria-current="page">{inner}</Link>
                : <a href={b.url} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>}
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
