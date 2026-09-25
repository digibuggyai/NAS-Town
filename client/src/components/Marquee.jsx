import { useRef } from 'react';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';

// Endless horizontal strip. Speeds up briefly with scroll velocity, then settles.
export default function Marquee({ items, speed = 40 }) {
  const track = useRef(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    const loop = gsap.to(track.current, { xPercent: -50, ease: 'none', duration: speed, repeat: -1 });
    const onWheel = () => {
      gsap.to(loop, { timeScale: 4, duration: 0.3, overwrite: true });
      gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.3 });
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  const row = (copy) => items.map((item, i) => (
    <li key={`${copy}-${i}`} className="flex shrink-0 items-center gap-10 pr-10 text-sm whitespace-nowrap text-white/45">
      {item}
      <span className="size-1 rounded-full bg-white/25" aria-hidden />
    </li>
  ));

  return (
    <div className="marquee-fade overflow-hidden py-6" aria-hidden>
      <ul ref={track} className="flex w-max">
        {row('a')}
        {row('b')}
      </ul>
    </div>
  );
}
