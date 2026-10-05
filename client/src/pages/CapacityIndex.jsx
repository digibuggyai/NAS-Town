import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { capacityPages } from '../data/site.js';
import { formatInr } from '../lib/api.js';
import { usePricing } from '../lib/nas/usePricing.js';
import { cheapestFor } from '../lib/nas/capacity.js';

// Hub for the capacity pages: "NAS storage by capacity", one row per size with a live starting price.
export default function CapacityIndex() {
  const { pricing: P } = usePricing('public');
  return (
    <>
      <Seo />
      <PageHero
        eyebrow="NAS by capacity"
        title="NAS Storage by *Capacity*"
        intro="Network attached storage is sized by usable space: what's left after RAID protection. Pick how much data you need to store, from 5TB for a home to 100TB for a business, and see real NAS builds with drives and GST-inclusive prices."
      >
        <Link to="/tools/calculator" className="btn btn-secondary">Calculate how much you need</Link>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28">
        <Reveal as="ul" className="rule-list border-y border-line">
          {capacityPages.map((c) => {
            const from = P ? cheapestFor(P, c.tb) : null;
            return (
              <li key={c.tb}>
                <Link
                  to={`/nas/${c.tb}tb`}
                  className="group grid gap-x-8 gap-y-1 py-6 transition-colors hover:bg-surface sm:grid-cols-[8rem_1fr_auto_auto] sm:items-baseline sm:px-3"
                >
                  <h2 className="text-xl sm:text-2xl">{c.tb}TB NAS</h2>
                  <p className="max-w-xl text-[0.95rem] text-muted">{c.who}</p>
                  <p className="mono text-sm text-fg">{from ? `from ${formatInr(from)}` : ''}</p>
                  <ArrowUpRight className="mt-2 size-5 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg sm:mt-0" aria-hidden />
                </Link>
              </li>
            );
          })}
        </Reveal>
      </section>
      <FinalCta />
    </>
  );
}
