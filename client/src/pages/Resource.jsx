import { Link, useParams } from 'react-router';
import { ChevronDown } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import { faqs, resources } from '../data/site.js';
import NotFound from './NotFound.jsx';

export default function Resource() {
  const { slug } = useParams();
  const r = resources.find((x) => x.slug === slug);
  if (!r) return <NotFound />;

  return (
    <>
      <title>{`${r.name} | NASTOWN`}</title>
      <PageHero eyebrow={`Resources · ${r.name}`} title={r.h1} intro={r.intro} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap gap-2">
          {resources.map((x) => (
            <Link key={x.slug} to={`/resources/${x.slug}`} className="chip" aria-pressed={x.slug === r.slug}>{x.name}</Link>
          ))}
        </div>
      </section>

      {r.slug === 'faq' ? (
        <section className="mx-auto max-w-3xl px-4 pb-28 sm:px-6">
          <div className="grid gap-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="glass group rounded-lg">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-base font-medium">
                  {q}
                  <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-center text-muted">
            Still have a question? <Link to="/about#contact" className="text-fg underline underline-offset-4">Talk to our team</Link>.
          </p>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {r.upcoming.map((title, i) => (
              <Reveal key={title} delay={(i % 2) * 80}>
                <article className="glass flex h-full flex-col rounded-xl p-8">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow !text-[0.65rem]">{r.name}</span>
                    <span className="rounded-full bg-surface px-2.5 py-1 text-[0.7rem] text-subtle ring-1 ring-line">Coming soon</span>
                  </div>
                  <h2 className="mt-10 text-xl font-medium">{title}</h2>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
