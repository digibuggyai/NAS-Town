import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, MessageCircle } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { hero } from '../data/home.js';
import { digibuggy } from '../data/site.js';

// The things that make someone comfortable buying storage online, answered up front.
const facts = [
  ['Prices', 'GST-inclusive, published'],
  ['Setup', 'Installed & configured by our team'],
  ['Showroom', digibuggy.addressShort],
];

// Callouts for Fig. 1, positioned against the drawing's geometry (see NasVisual: 4 sleds, LEDs at 68% height).
const annotations = [
  { label: 'Drive bays', note: 'From 2 to 8 drives in one box', top: '19%', lineTop: '29%', from: '21%', to: '31.5%', side: 'left' },
  { label: 'Status LEDs', note: 'A glance tells you each drive is healthy', top: '56%', lineTop: '63%', from: '21%', to: '35%', side: 'left' },
  { label: 'RAID', note: 'One drive can fail. Nothing is lost.', top: '39%', lineTop: '46.5%', from: '68.5%', to: '79%', side: 'right' },
];

export default function Hero() {
  const root = useRef(null);

  // One short entrance: copy settles, then the product appears. No parallax, no looping.
  useGSAP(() => {
    if (reducedMotion()) return;
    const tl = gsap.timeline({ paused: true, delay: 0.1 });
    document.fonts.ready.then(() => tl.play());
    tl.from('.hero-fade', { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.08 }, 0.35)
      .from('.hero-figure', { autoAlpha: 0, y: 20, duration: 0.9 }, 0.45);
  }, { scope: root });

  return (
    <section ref={root} className="mx-auto max-w-7xl px-4 pt-28 pb-14 sm:px-6 md:pt-32 lg:pb-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div>
          <p className="hero-fade eyebrow">{hero.eyebrow}</p>
          <SplitHeading as="h1" immediate delay={0.1} text={hero.title} className="display mt-5" />
          <div className="hero-fade mt-7 max-w-xl space-y-3 text-[1.0625rem] leading-relaxed text-muted sm:text-lg">
            {hero.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
            <Link to="/finder" className="btn btn-primary">Find My NAS <ArrowRight className="size-4" /></Link>
            <Link to="/tools/configurator" className="btn btn-secondary">Build My NAS</Link>
          </div>
        </div>

        <figure className="hero-figure">
          {/* Annotated like a manual diagram. Positions are % of the plate; the NAS is centred at 58% width. */}
          <div className="plate relative aspect-[16/11]">
            <NasVisual bays={4} live className="absolute top-1/2 left-1/2 w-[58%] -translate-x-1/2 -translate-y-1/2" />
            {annotations.map(({ label, note, top, lineTop, from, to, side }) => (
              <div key={label} aria-hidden className="hidden sm:block">
                <div className="absolute h-px bg-line-strong" style={{ top: lineTop, left: from, width: `calc(${to} - ${from})` }}>
                  <span className={`absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-fg ${side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}`} />
                </div>
                <div className={`absolute w-[19%] ${side === 'left' ? 'left-[3%]' : 'right-[3%] text-right'}`} style={{ top }}>
                  <p className="mono text-[0.68rem] tracking-wide text-fg uppercase">{label}</p>
                  <p className="mt-0.5 text-[0.72rem] leading-snug text-muted">{note}</p>
                </div>
              </div>
            ))}
          </div>
          <figcaption className="mt-3 flex justify-between gap-4 text-xs text-subtle">
            <span className="mono whitespace-nowrap">Fig. 1</span>
            <span className="text-right">A 4-bay NAS: four drives, one box, every device connected.</span>
          </figcaption>
        </figure>
      </div>

      {/* Trust facts on a hairline. */}
      <dl className="hero-fade mt-14 grid gap-y-5 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(([k, v]) => (
          <div key={k} className="sm:pr-6">
            <dt className="eyebrow">{k}</dt>
            <dd className="mt-1 text-[0.95rem]">{v}</dd>
          </div>
        ))}
        <div>
          <dt className="eyebrow">Talk to a person</dt>
          <dd className="mt-1 text-[0.95rem]">
            <a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="link inline-flex items-center gap-1.5">
              <MessageCircle className="size-4" /> {digibuggy.whatsapp}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
