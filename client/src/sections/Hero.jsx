import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import SplitHeading from '../components/SplitHeading.jsx';
import NasHero from '../components/NasHero.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { hero } from '../data/home.js';

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
    <section ref={root} className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 md:pt-32 lg:pb-16">
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
          <NasHero />
          <figcaption className="mt-3 text-xs text-subtle sm:text-right">
            Synology DS925+: four drives in one box, every device connected.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
