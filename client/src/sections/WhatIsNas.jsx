import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Globe, HardDrive, Share2, ShieldCheck } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import Reveal from '../components/Reveal.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { whatIsNas } from '../data/home.js';

const ICONS = { store: HardDrive, protect: ShieldCheck, share: Share2, access: Globe };

export default function WhatIsNas() {
  const stage = useRef(null);

  // The four capabilities slide out from the NAS, then it floats gently.
  useGSAP(() => {
    if (reducedMotion()) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: stage.current, start: 'top 70%', once: true } });
    tl.from('.wn-nas', { autoAlpha: 0, scale: 0.8, duration: 1.4 })
      // Cards slide outward from the NAS toward their column.
      .from('.wn-point', {
        autoAlpha: 0,
        x: (_, el) => (el.dataset.side === 'left' ? 80 : -80),
        scale: 0.92,
        duration: 1.3,
        stagger: 0.08,
      }, 0.25);
    gsap.to('.wn-nas', { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }, { scope: stage });

  return (
    <section id="what-is-nas" className="relative scroll-mt-24 bg-gradient-to-b from-transparent via-ink-2/80 to-transparent py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Reveal y={12}><p className="eyebrow mb-5">{whatIsNas.eyebrow}</p></Reveal>
          <SplitHeading text={whatIsNas.title} className="text-3xl sm:text-4xl lg:text-5xl" />
          <Reveal delay={150} y={20}>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
              {whatIsNas.body.map((p) => <p key={p}>{p}</p>)}
            </div>
            <Link to="/resources/guides" className="magnetic btn btn-glass mt-8">{whatIsNas.cta} <ArrowRight className="size-4" /></Link>
          </Reveal>
        </div>

        <div ref={stage} className="relative">
          {/* Desktop: Store & Share on the left, the NAS in the middle, Protect & Access on the right */}
          <div className="relative hidden grid-cols-[1fr_0.8fr_1fr] items-center gap-5 md:grid">
            <div className="pointer-events-none absolute inset-[25%] rounded-full bg-accent/10 blur-3xl" />
            {[[0, 2], [1, 3]].map((pair, col) => (
              <div key={col} className={`grid gap-5 ${col === 1 ? 'order-3' : 'order-1'}`}>
                {pair.map((i) => {
                  const { key, title, body } = whatIsNas.points[i];
                  const Icon = ICONS[key];
                  return (
                    <div key={key} className="wn-point tilt glass liquid rounded-3xl p-5" data-side={col === 0 ? 'left' : 'right'}>
                      <span className="grid size-9 place-items-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
                        <Icon className="size-4 text-accent" />
                      </span>
                      <h3 className="mt-4 text-lg font-medium">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="wn-nas order-2 relative">
              <NasVisual bays={4} className="w-full" />
            </div>
          </div>

          {/* Mobile: NAS, then a 2 × 2 grid */}
          <div className="md:hidden">
            <NasVisual bays={4} className="mx-auto w-1/2" />
            <div className="mt-6 grid grid-cols-2 gap-3">
              {whatIsNas.points.map(({ key, title, body }) => {
                const Icon = ICONS[key];
                return (
                  <div key={key} className="glass rounded-2xl p-4">
                    <Icon className="size-4 text-accent" />
                    <h3 className="mt-3 font-medium">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
