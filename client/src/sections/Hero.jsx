import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CalendarCheck, MessageCircle } from 'lucide-react';
import SplitHeading from '../components/SplitHeading.jsx';
import NasHddAnimation from '../components/NasHddAnimation.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { hero } from '../data/home.js';
import { digibuggy, waLink } from '../data/site.js';
import { experienceZone } from '../config/siteContent.js';

// The things that make someone comfortable buying storage online, answered up front.
const facts = [
  ['Prices', 'GST-inclusive, published'],
  ['Setup', 'Installed & configured by our team'],
];

export default function Hero() {
  const root = useRef(null);

  // One short entrance: copy settles, then the product panel appears.
  useGSAP(() => {
    if (reducedMotion()) return;
    const tl = gsap.timeline({ paused: true, delay: 0.1 });
    document.fonts.ready.then(() => tl.play());
    tl.from('.hero-fade', { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.08 }, 0.35)
      .from('.hero-figure', { autoAlpha: 0, y: 20, duration: 0.9 }, 0.45);
  }, { scope: root });

  return (
    <section ref={root} className="mx-auto max-w-7xl px-4 pt-28 pb-14 sm:px-6 md:pt-32 lg:pb-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div>
          <p className="hero-fade eyebrow">{hero.eyebrow}</p>
          <SplitHeading as="h1" immediate delay={0.1} text={hero.title} className="display mt-5" />
          <div className="hero-fade mt-7 max-w-xl space-y-3 text-lg leading-relaxed">
            {hero.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
            <Link to="/tools/configurator" className="btn btn-primary">Build your NAS <ArrowRight className="size-4" /></Link>
            <Link to="/finder" className="btn btn-secondary">Help me choose</Link>
          </div>
        </div>

        <figure className="hero-figure">
          {/* Dark stage for the product animation */}
          <div className="overflow-hidden rounded-[24px] bg-[radial-gradient(120%_90%_at_60%_35%,#1e293b_0%,#0f172a_55%,#070b14_100%)] px-2 py-4 shadow-[0_24px_60px_-30px_rgb(15_23_42/0.6)] sm:px-6 sm:py-8">
            <NasHddAnimation />
          </div>
          <figcaption className="mt-3 text-xs text-subtle sm:text-right">
            A 4-bay NAS: four drives, one box, every device connected.
          </figcaption>
        </figure>
      </div>

      {/* Trust facts on a hairline. */}
      <dl className="hero-fade mt-14 grid gap-y-5 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(([k, v]) => (
          <div key={k} className="sm:pr-6">
            <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">{k}</dt>
            <dd className="mt-1 font-medium text-fg">{v}</dd>
          </div>
        ))}
        <div className="sm:pr-6">
          <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">{experienceZone.name}</dt>
          <dd className="mt-1">
            <a href={digibuggy.mapsHref} target="_blank" rel="noopener noreferrer" className="font-medium text-fg hover:text-accent">{digibuggy.addressShort}</a>
            <a href={waLink(experienceZone.bookVisitText)} target="_blank" rel="noopener noreferrer" className="link mt-0.5 flex items-center gap-1.5 text-sm">
              <CalendarCheck className="size-3.5" aria-hidden /> Book a visit
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">Talk to a person</dt>
          <dd className="mt-1">
            <a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="link inline-flex items-center gap-1.5">
              <MessageCircle className="size-4" /> {digibuggy.whatsapp}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
