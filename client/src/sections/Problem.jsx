import { Link } from 'react-router';
import { ArrowDown } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { problem } from '../data/home.js';

// Where data actually lives today, and what goes wrong there. Concrete beats abstract.
const ledger = [
  ['Phone & SD cards', 'Always nearly full'],
  ['Laptop & external drives', 'One drop from gone'],
  ['Cloud accounts', 'A bill that keeps growing'],
  ['Office PCs & email', 'Hard to find, harder to share'],
];

export default function Problem() {
  const [first, ...rest] = problem.body;
  const last = rest.pop();

  return (
    <section className="theme-dark">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow mb-4">{problem.eyebrow}</p>
          <h2 className="h-section">{problem.title}</h2>
          <div className="measure mt-6 space-y-3 text-muted">
            <p>{first}</p>
            {rest.map((p) => <p key={p}>{p}</p>)}
          </div>
          <p className="mt-6 flex items-start gap-3 text-lg leading-snug">
            <span className="led mt-2 shrink-0" aria-hidden /> {last}
          </p>
          <Link to="/#what-is-nas" className="link mt-8 inline-flex items-center gap-2 text-[0.95rem]">
            {problem.cta} <ArrowDown className="size-4" />
          </Link>
        </Reveal>

        <Reveal delay={120} className="self-center">
          <p className="eyebrow mb-3">Where your data lives today</p>
          <dl className="rule-list border-y border-line">
            {ledger.map(([where, issue]) => (
              <div key={where} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4">
                <dt className="text-[1.05rem]">{where}</dt>
                <dd className="mono text-xs text-subtle sm:text-right">{issue}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-subtle">Four places, four ways to lose something. A NAS makes it one.</p>
        </Reveal>
      </div>
    </section>
  );
}
