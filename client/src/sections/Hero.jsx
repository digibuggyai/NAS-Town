import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import Marquee from '../components/Marquee.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { hero } from '../data/home.js';

const strip = ['Synology DSM', 'QNAP QTS', 'RAID 1 · 5 · 6 · 10', 'SHR', '2.5GbE & 10GbE', 'NVMe caching', 'Snapshots', 'Hybrid backup', 'Remote access', 'Surveillance'];

export default function Hero() {
  const root = useRef(null);

  useGSAP(() => {
    if (reducedMotion()) return;
    // Start once web fonts are in, so the intro isn't eaten by load-time jank.
    const tl = gsap.timeline({ paused: true, delay: 0.2 });
    document.fonts.ready.then(() => tl.play());
    tl.from('.hero-eyebrow', { autoAlpha: 0, y: 14, duration: 1 })
      .from('.hero-sub', { autoAlpha: 0, y: 18, filter: 'blur(6px)', duration: 1.2, clearProps: 'filter' }, 0.55)
      .from('.hero-cta > *', { autoAlpha: 0, y: 18, stagger: 0.08, duration: 1.1 }, 0.7)
      .from('.hero-stage', { autoAlpha: 0, y: 80, scale: 0.94, duration: 1.8, ease: 'expo.out' }, 0.6)
      .from('.hero-stage .glow', { autoAlpha: 0, scale: 0.6, duration: 2.4, ease: 'power2.out' }, 0.9);

    // Scroll: the NAS sinks and the headline drifts up and fades, for depth.
    gsap.to('.hero-nas', {
      yPercent: 12, scale: 0.96, ease: 'none',
      scrollTrigger: { trigger: '.hero-stage', start: 'top 60%', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero-copy', {
      y: -60, autoAlpha: 0.2, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: '45% top', scrub: true },
    });
  }, { scope: root });

  return (
    <section ref={root} className="relative pt-32 pb-8 text-center">
      <div className="hero-copy mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-6">
        <p className="hero-eyebrow eyebrow">{hero.eyebrow}</p>
        <SplitHeading
          as="h1"
          immediate
          delay={0.45}
          text={hero.title}
          className="mt-6 text-[2.6rem] sm:text-6xl lg:text-7xl"
        />
        <div className="hero-sub mx-auto mt-6 max-w-xl space-y-3 text-base text-muted sm:text-lg">
          {hero.body.map((p) => <p key={p}>{p}</p>)}
        </div>
        <div className="hero-cta mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/finder" className="magnetic btn btn-primary">Find My NAS <ArrowRight className="size-4" /></Link>
          <Link to="/tools/configurator" className="magnetic btn btn-glass">Build My NAS</Link>
        </div>
      </div>

      <div className="hero-stage relative mx-auto mt-16 w-full max-w-3xl px-4 sm:px-6">
        {/* Replace NasVisual with real product photography when available. */}
        <div className="glow absolute inset-x-[15%] top-[20%] h-2/3 rounded-full bg-accent/25 blur-[90px]" />
        <div className="tilt glass liquid relative rounded-[2.25rem] px-8 pt-10 pb-4 sm:px-16" data-tilt="5">
          <div className="hero-nas">
            <NasVisual bays={4} className="mx-auto w-full max-w-md" />
          </div>
          <div className="mt-2 grid grid-cols-3 divide-x divide-white/10 border-t border-line py-5 text-left text-xs sm:text-sm">
            {[['Private', 'Your cloud, your rules'], ['Protected', 'RAID + snapshots'], ['Anywhere', 'Secure remote access']].map(([k, v]) => (
              <div key={k} className="px-3 sm:px-6">
                <p className="font-medium">{k}</p>
                <p className="mt-0.5 text-muted">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl">
        <Marquee items={strip} />
      </div>
    </section>
  );
}
