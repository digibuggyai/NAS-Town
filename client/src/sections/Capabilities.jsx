import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { capabilities } from '../data/site.js';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';

export default function Capabilities() {
  const orbit = useRef(null);

  // Capabilities burst out of the NAS into orbit, then the NAS gently floats.
  useGSAP(() => {
    if (reducedMotion()) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: orbit.current, start: 'top 70%', once: true } });
    tl.from('.orbit-nas', { autoAlpha: 0, scale: 0.7, duration: 1.4 })
      .from('.orbit-pill', { left: '50%', top: '50%', autoAlpha: 0, scale: 0.4, duration: 1.6, stagger: 0.06, ease: 'expo.out' }, 0.25);
    gsap.to('.orbit-nas', { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }, { scope: orbit });

  return (
    <section className="relative bg-gradient-to-b from-transparent via-ink-2/80 to-transparent py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="More than storage" title="One Box. A Lot *More Than Storage.*">
          A NAS is your private cloud, backup solution, media server, collaboration hub and more.
        </SectionHeading>

        {/* Desktop: capabilities orbit the NAS */}
        <div ref={orbit} className="relative mx-auto mt-16 hidden aspect-square max-w-[640px] md:block">
          <div className="absolute inset-[12%] rounded-full border border-dashed border-white/10 animate-spin-slow" />
          <div className="absolute inset-[30%] rounded-full bg-accent/10 blur-3xl" />
          <div className="orbit-nas absolute inset-[31%] grid place-items-center">
            <NasVisual bays={4} className="w-full" />
          </div>
          {capabilities.map(({ name, icon: Icon }, i) => {
            const angle = (i / capabilities.length) * Math.PI * 2 - Math.PI / 2;
            const left = 50 + Math.cos(angle) * 40;
            const top = 50 + Math.sin(angle) * 40;
            return (
              <div
                key={name}
                className="orbit-pill glass liquid absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full py-2.5 pr-4 pl-3 text-sm whitespace-nowrap"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <span className="grid size-7 place-items-center rounded-full bg-white/10">
                  <Icon className="size-3.5 text-accent" />
                </span>
                {name}
              </div>
            );
          })}
        </div>

        {/* Mobile: NAS then a grid */}
        <div className="mt-12 md:hidden">
          <NasVisual bays={4} className="mx-auto w-2/3" />
          <div className="mt-8 grid grid-cols-2 gap-3">
            {capabilities.map(({ name, icon: Icon }) => (
              <div key={name} className="glass flex items-center gap-2.5 rounded-2xl p-3 text-sm">
                <Icon className="size-4 shrink-0 text-accent" /> {name}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/resources/guides" className="btn btn-glass">Explore What NAS Can Do <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
