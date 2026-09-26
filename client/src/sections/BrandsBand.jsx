import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../lib/hooks.js';
import { usePricing } from '../lib/nas/usePricing.js';

// The brands inside a NASTOWN build: the box and the drives. Logos are shown in one
// muted tone so they read as a set; model counts come live from the catalogue.
const groups = [
  {
    label: 'NAS systems',
    items: [
      { key: 'synology', name: 'Synology', logo: '/images/brands/synology.svg', h: 'h-7', to: '/brands/synology', line: 'DSM' },
      { key: 'qnap', name: 'QNAP', logo: '/images/brands/qnap.svg', h: 'h-6', to: '/brands/qnap', line: 'QTS' },
    ],
  },
  {
    label: 'NAS drives',
    items: [
      { key: 'seagate', name: 'Seagate', driveBrand: 'Seagate', logo: '/images/brands/seagate.svg', h: 'h-7', line: 'IronWolf · IronWolf Pro · Exos' },
      { key: 'wd', name: 'Western Digital', driveBrand: 'Western Digital', logo: '/images/brands/wd.svg', h: 'h-8', line: 'Ultrastar' },
    ],
  },
];

export default function BrandsBand() {
  const { data } = useProducts();
  const { pricing } = usePricing('public');
  const models = (brand) => data?.filter((p) => p.brand === brand).length;
  // Capacity range for a drive maker, from the lines we actually price.
  const capRange = (brand) => {
    if (!pricing) return null;
    const lines = new Set(pricing.driveLines.filter((l) => l.brand === brand).map((l) => l.name));
    const caps = pricing.capacities.filter((c) => Object.keys(pricing.hddPricing[c] ?? {}).some((l) => lines.has(l)));
    return caps.length ? `${caps[0]}–${caps[caps.length - 1]} TB drives` : null;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <Reveal className="max-w-2xl">
        <p className="eyebrow mb-4">Brands</p>
        <h2 className="h-section">The brands inside your NAS.</h2>
        <p className="measure mt-5 text-muted">The box and the drives both matter. We build with platforms and NAS-rated drives we'd trust with our own data.</p>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-8">
        {groups.map((g, gi) => (
          <Reveal key={g.label} delay={gi * 100}>
            <p className="eyebrow mb-3">{g.label}</p>
            <ul className="grid grid-cols-2 border-y border-line">
              {g.items.map((b, i) => {
                const detail = b.driveBrand ? capRange(b.driveBrand) : models(b.key) ? `${models(b.key)} models listed` : null;
                const body = (
                  <>
                    <div className="flex h-12 items-center">
                      <img
                        src={b.logo}
                        alt={b.name}
                        loading="lazy"
                        className={`${b.h} w-auto max-w-full opacity-80 brightness-[0.25] contrast-125 grayscale transition duration-300 group-hover:opacity-100 group-hover:filter-none`}
                      />
                    </div>
                    <p className="mono mt-4 text-xs text-muted">{b.line}</p>
                    {detail && <p className="mono mt-1 text-xs text-subtle">{detail}</p>}
                  </>
                );
                return (
                  <li key={b.key} className={i === 1 ? 'border-l border-line' : ''}>
                    {b.to ? (
                      <Link to={b.to} className="group relative block h-full p-5 transition-colors hover:bg-surface sm:p-6">
                        {body}
                        <ArrowUpRight className="absolute top-5 right-5 size-4 text-subtle transition-colors group-hover:text-fg" aria-hidden />
                      </Link>
                    ) : (
                      <div className="group h-full p-5 sm:p-6">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
