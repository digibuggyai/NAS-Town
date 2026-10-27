import { useRef } from 'react';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';

/*
 * Hero picture: the official Synology DS925+ photo (background removed) on a soft studio
 * stage. It floats gently, tilts a little towards the cursor, and its five front LEDs behave
 * like a working NAS: status steady green, the four disk lights flickering with activity.
 * LED positions are percentages of the 906 × 670 photo. People who prefer less motion get
 * the still photo.
 */
const LEDS = [
  { top: '32.8%', steady: true },
  { top: '37.6%', dur: '1.9s', delay: '0s' },
  { top: '42.4%', dur: '1.3s', delay: '0.4s' },
  { top: '47.0%', dur: '2.4s', delay: '0.9s' },
  { top: '51.8%', dur: '1.6s', delay: '0.2s' },
];

export default function NasHero() {
  const stage = useRef(null);
  const box = useRef(null);

  useGSAP(() => {
    if (reducedMotion()) return;
    const el = stage.current;
    const rx = gsap.quickTo(box.current, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(box.current, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 10);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
    };
    const leave = () => { rx(0); ry(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, { scope: stage });

  return (
    <div ref={stage} className="nas-stage relative overflow-hidden rounded-[24px] px-6 pt-10 pb-8 sm:px-12 sm:pt-14 sm:pb-10 [perspective:1200px]">
      <div className="nas-float relative mx-auto max-w-[34rem]">
        <div ref={box} className="relative [transform-style:preserve-3d]">
          <img
            src="/images/hero/ds925plus.webp"
            srcSet="/images/hero/ds925plus-604.webp 604w, /images/hero/ds925plus.webp 906w"
            sizes="(min-width: 1024px) 34rem, 90vw"
            width="906"
            height="670"
            alt="Synology DS925+ 4-bay NAS with its drive lights on"
            fetchPriority="high"
            className="relative block h-auto w-full select-none"
            draggable="false"
          />
          {LEDS.map((l) => (
            <span
              key={l.top}
              aria-hidden
              className={l.steady ? 'nas-led' : 'nas-led nas-led-blink'}
              style={{ left: '47.25%', top: l.top, animationDuration: l.dur, animationDelay: l.delay }}
            />
          ))}
        </div>
      </div>
      {/* Contact shadow on the "floor"; it breathes with the float. */}
      <div aria-hidden className="nas-floor mx-auto -mt-3 h-6 w-[70%] max-w-[26rem] rounded-[50%] bg-[radial-gradient(closest-side,rgb(15_23_42/0.35),transparent)]" />
    </div>
  );
}
