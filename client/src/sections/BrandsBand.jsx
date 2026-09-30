import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../lib/hooks.js';
import { usePricing } from '../lib/nas/usePricing.js';
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from '../lib/motion.js';

// The brands inside a NASTOWN build: the box and the drives, shown as a slow,
// continuous strip. Model counts and drive sizes come live from the catalogue.
const BRANDS = [
  { key: 'synology', name: 'Synology', kind: 'NAS system', logo: '/images/brands/synology.svg', h: 'h-7', to: '/brands/synology', line: 'DSM' },
  { key: 'seagate', name: 'Seagate', kind: 'NAS drives', driveBrand: 'Seagate', logo: '/images/brands/seagate.svg', h: 'h-7', line: 'IronWolf · IronWolf Pro · Exos' },
  { key: 'qnap', name: 'QNAP', kind: 'NAS system', logo: '/images/brands/qnap.svg', h: 'h-6', to: '/brands/qnap', line: 'QTS' },
  { key: 'wd', name: 'Western Digital', kind: 'NAS drives', driveBrand: 'Western Digital', logo: '/images/brands/wd.svg', h: 'h-8', line: 'Ultrastar' },
];

function BrandCard({ b, detail, hidden }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-subtle ring-1 ring-line">{b.kind}</span>
        {b.to && <ArrowUpRight className="size-4 text-subtle transition-colors group-hover:text-accent" aria-hidden />}
      </div>
      <div className="mt-5 flex h-10 items-center">
        <img src={b.logo} alt={hidden ? '' : b.name} loading="lazy" className={`${b.h} w-auto max-w-full`} />
      </div>
      <p className="mt-4 text-sm text-body">{b.line}</p>
      <p className="mt-0.5 min-h-5 text-xs text-subtle">{detail}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
        <BadgeCheck className="size-3.5" aria-hidden /> Authorized dealer
      </p>
    </>
  );
  const cls = 'group block h-full w-[272px] rounded-2xl border border-line bg-raised p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_14px_30px_-18px_rgb(15_23_42/0.35)]';
  return b.to && !hidden
    ? <Link to={b.to} className={cls}>{body}</Link>
    : <div className={cls}>{body}</div>;
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
    return caps.length ? `${caps[0]}–${caps[caps.length - 1]} TB drives` : null;
  };
  // GSAP loop: slides exactly one half-width, so it's seamless. Hover or keyboard focus
  // eases it to a stop (timeScale → 0) and back, instead of freezing mid-motion.
  const strip = useRef(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    const track = strip.current.querySelector('.marquee-track');
    const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    const slow = (to) => gsap.to(loop, { timeScale: to, duration: 0.7, ease: 'power2.out', overwrite: true });
    const el = strip.current;
    const stop = () => slow(0);
    const go = () => slow(1);
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', go);
    el.addEventListener('focusin', stop);
    el.addEventListener('focusout', go);
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? loop.resume() : loop.pause()) });
    return () => {
      el.removeEventListener('mouseenter', stop);
      el.removeEventListener('mouseleave', go);
      el.removeEventListener('focusin', stop);
      el.removeEventListener('focusout', go);
    };
  }, { scope: strip });

  const detail = (b) => (b.driveBrand ? capRange(b.driveBrand) : models(b.key) ? `${models(b.key)} models listed` : null);

  // The strip is two identical halves; it slides by exactly one half, so the loop is seamless.
  // Each half repeats the set twice so it's always wider than the screen.
  const half = [...BRANDS, ...BRANDS];

  return (
    <section className="py-16 md:py-24">
      <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Authorized dealer</p>
          <h2 className="h-section">The brands inside your NAS.</h2>
          <p className="measure mt-5 text-muted">
            We're an authorized dealer for Synology, QNAP, Seagate and Western Digital, so every NAS and drive we supply is genuine
            and sourced through official channels. The box and the drives both matter, and we build with ones we'd trust with our own data.
          </p>
        </div>
      </Reveal>

      <div ref={strip} className="marquee mt-10" aria-label="Brands we are an authorized dealer for">
        <ul className="marquee-track flex w-max gap-5 py-2 pl-5">
          {[...half, ...half].map((b, i) => {
            const copy = i >= BRANDS.length; // only the first set is exposed to screen readers
            return (
              <li key={`${b.key}-${i}`} aria-hidden={copy || undefined}>
                <BrandCard b={b} detail={detail(b)} hidden={copy} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
