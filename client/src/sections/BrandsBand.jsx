import { Link } from 'react-router';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../lib/hooks.js';
import { usePricing } from '../lib/nas/usePricing.js';

// The brands inside a NASTOWN build, as a logo wall in two groups: the box (NAS systems) and
// the drives. Official logos in their own colours (images/brands/CREDITS.md). Model counts and
// drive sizes come live from the catalogue.
const GROUPS = [
  {
    title: 'The box',
    note: 'NAS systems',
    brands: [
      { key: 'synology', name: 'Synology', logo: '/images/brands/synology.svg', size: [131, 34], h: 'h-9 sm:h-10', to: '/brands/synology', line: 'DSM' },
      { key: 'qnap', name: 'QNAP', logo: '/images/brands/qnap.svg', size: [138, 24], h: 'h-7 sm:h-8', to: '/brands/qnap', line: 'QTS' },
    ],
  },
  {
    title: 'The drives',
    note: 'NAS hard drives',
    brands: [
      { key: 'seagate', name: 'Seagate', driveBrand: 'Seagate', logo: '/images/brands/seagate.svg', size: [200, 49], h: 'h-10 sm:h-11', line: 'IronWolf · Exos' },
      { key: 'wd', name: 'Western Digital', driveBrand: 'Western Digital', logo: '/images/brands/wd.svg', size: [83, 48], h: 'h-11 sm:h-12', line: 'Ultrastar' },
    ],
  },
];

function Tile({ b, detail }) {
  const inner = (
    <>
      {b.to && <ArrowUpRight className="absolute top-4 right-4 size-4 text-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />}
      <div className="grid h-16 place-items-center">
        <img src={b.logo} alt={b.name} width={b.size[0]} height={b.size[1]} loading="lazy" decoding="async" className={`${b.h} w-auto max-w-full transition-transform duration-300 group-hover:scale-105`} />
      </div>
      <p className="mt-4 text-center text-xs text-subtle">
        {b.line}{detail && <> · <span className="whitespace-nowrap">{detail}</span></>}
      </p>
    </>
  );
  const cls = 'group relative block px-5 py-8 transition-colors hover:bg-accent-soft/50 sm:px-8 sm:py-10';
  return b.to ? <Link to={b.to} className={cls} aria-label={`${b.name} NAS`}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

export default function BrandsBand() {
  const { data } = useProducts();
  const { pricing } = usePricing('public');
  const models = (brand) => data?.filter((p) => p.brand === brand).length;
  // Capacity range for a drive maker, from the lines we actually price.
  const capRange = (brand) => {
    if (!pricing) return null;
    const lines = new Set(pricing.driveLines.filter((l) => l.brand === brand).map((l) => l.name));
    const caps = pricing.capacities.filter((c) => Object.keys(pricing.hddPricing[c] ?? {}).some((l) => lines.has(l)));
    return caps.length ? `${caps[0]}–${caps[caps.length - 1]} TB` : null;
  };
  const detail = (b) => (b.driveBrand ? capRange(b.driveBrand) : models(b.key) ? `${models(b.key)} models` : null);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow mb-4">Authorized dealer</p>
          <h2 className="h-section">The brands inside your NAS</h2>
          <p className="mt-5 text-muted">
            We're an authorized dealer for Synology, QNAP, Seagate and Western Digital, so every NAS and drive we supply is genuine
            and sourced through official channels. The box and the drives both matter, and we build with ones we'd trust with our own data.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-2 text-sm font-medium text-accent-strong">
            <BadgeCheck className="size-4" aria-hidden /> Genuine, official-channel stock
          </p>
        </Reveal>

        {/* Logo wall: two rows (box, drives), two logos each, split by hairlines. */}
        <Reveal delay={100} className="overflow-hidden rounded-3xl border border-line bg-raised">
          {GROUPS.map((g, i) => (
            <div key={g.title} className={i ? 'border-t border-line' : ''}>
              <div className="flex items-baseline justify-between gap-3 px-5 pt-5 sm:px-8">
                <h3 className="text-sm font-semibold">{g.title}</h3>
                <p className="text-xs text-subtle">{g.note}</p>
              </div>
              <ul className="grid grid-cols-2 divide-x divide-line" aria-label={g.note}>
                {g.brands.map((b) => <li key={b.key}><Tile b={b} detail={detail(b)} /></li>)}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
