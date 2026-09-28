import { useId, useRef } from 'react';
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from '../lib/motion.js';

/*
 * Hero animation: a static 4-bay NAS with one empty bay. A 3.5" drive in its
 * caddy approaches from the left (closer to the viewer, so larger), pushes into
 * the bay, lights a soft blue "connected" glow, holds, then slides back out along
 * the identical path. Start and end frames match, so the loop is seamless.
 *
 * Geometry (drawn on an 800×500 grid, viewBox cropped to the action): chassis
 * 330–710 × 110–390; bays are 62 wide with a 16 gap starting at x=372, y 150–352.
 * Bay 0 (leftmost) is the empty one, centred at (403, 251). The drive group is
 * drawn exactly in bay 0, so the seated state is the identity transform and every
 * other state is an offset from it.
 */
const BAY_X = [372, 450, 528, 606];
const BAY_Y = 150;
const BAY_W = 62;
const BAY_H = 202;
const SEAT = '403 251';
const OUT_X = -292; // start position, clear of the chassis on the left
const OUT_SCALE = 1.28; // nearer the viewer before it is pushed in

function Sled({ x, id, led = 'idle' }) {
  return (
    <g>
      <rect x={x} y={BAY_Y} width={BAY_W} height={BAY_H} rx="9" fill={`url(#sled-${id})`} stroke="#fff" strokeOpacity="0.07" />
      {Array.from({ length: 11 }).map((_, j) => (
        <rect key={j} x={x + 13} y={BAY_Y + 18 + j * 11} width={BAY_W - 26} height="2.6" rx="1.3" fill="#fff" fillOpacity="0.07" />
      ))}
      {/* Release latch */}
      <rect x={x + 16} y={BAY_Y + BAY_H - 30} width={BAY_W - 32} height="8" rx="4" fill="#fff" fillOpacity="0.1" />
      {led === 'idle' && <circle cx={x + BAY_W / 2} cy={BAY_Y + BAY_H - 12} r="2.6" fill="#94a3b8" fillOpacity="0.55" />}
    </g>
  );
}

export default function NasHddAnimation({ className = '' }) {
  const id = useId().replace(/:/g, '');
  const root = useRef(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const drive = q('.hdd');
    const shadow = q('.hdd-shadow');
    const glow = q('.bay-glow, .hdd-led, .activity');

    // Reduced motion: show the connected state, no loop.
    if (reducedMotion()) {
      gsap.set(glow, { opacity: 1 });
      return;
    }

    gsap.set(drive, { svgOrigin: SEAT, x: OUT_X, scale: OUT_SCALE });
    gsap.set(shadow, { svgOrigin: SEAT, x: OUT_X, scale: OUT_SCALE, opacity: 0.55 });
    gsap.set(glow, { opacity: 0 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7, defaults: { ease: 'power2.inOut' } });
    tl
      // Approach: horizontal move to line up with the empty bay.
      .to([drive, shadow], { x: 0, duration: 1.5 })
      // Insert: push into the bay (scale to fit), shadow tucks under the chassis.
      .to(drive, { scale: 1, duration: 0.9, ease: 'power3.inOut' })
      .to(shadow, { scale: 1, opacity: 0, duration: 0.9, ease: 'power3.inOut' }, '<')
      // Connected: soft blue glow and a few activity pulses.
      .to(glow, { opacity: 1, duration: 0.45, ease: 'power1.out' })
      .to(q('.activity'), { opacity: 0.35, duration: 0.18, repeat: 5, yoyo: true, ease: 'sine.inOut' }, '<0.2')
      .to({}, { duration: 0.35 })
      .to(glow, { opacity: 0, duration: 0.35, ease: 'power1.in' })
      // Eject: out of the bay, then back along the same path.
      .to(drive, { scale: OUT_SCALE, duration: 0.8, ease: 'power3.inOut' })
      .to(shadow, { scale: OUT_SCALE, opacity: 0.55, duration: 0.8, ease: 'power3.inOut' }, '<')
      .to([drive, shadow], { x: OUT_X, duration: 1.4 });

    // Only run while the hero is on screen.
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
    });
  }, { scope: root });

  return (
    <div ref={root} className={className}>
      <svg viewBox="40 85 700 340" className="block h-auto w-full" role="img" aria-label="A drive sliding into a 4-bay NAS and connecting">
        <defs>
          <linearGradient id={`body-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2b2f36" />
            <stop offset="0.45" stopColor="#121418" />
            <stop offset="1" stopColor="#07080a" />
          </linearGradient>
          <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="0.4" stopColor="#fff" stopOpacity="0.04" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id={`sled-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#23262c" />
            <stop offset="1" stopColor="#0e1013" />
          </linearGradient>
          <linearGradient id={`slot-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#020304" />
            <stop offset="1" stopColor="#0a0c0f" />
          </linearGradient>
          <radialGradient id={`floor-${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#000" stopOpacity="0.55" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`blue-${id}`} cx="0.5" cy="0.55" r="0.6">
            <stop offset="0" stopColor="#3a67ff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#3a67ff" stopOpacity="0" />
          </radialGradient>
          <filter id={`soft-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {/* Contact shadow under the NAS */}
        <ellipse cx="520" cy="402" rx="210" ry="16" fill={`url(#floor-${id})`} />

        {/* Static NAS chassis */}
        <rect x="330" y="110" width="380" height="280" rx="28" fill={`url(#body-${id})`} />
        <rect x="330.5" y="110.5" width="379" height="279" rx="27.5" fill="none" stroke={`url(#rim-${id})`} />
        <path d="M358 111 H682" stroke="#fff" strokeOpacity="0.28" />

        {/* Empty bay 0: recessed slot with the SATA connector at the back */}
        <rect x={BAY_X[0]} y={BAY_Y} width={BAY_W} height={BAY_H} rx="9" fill={`url(#slot-${id})`} stroke="#fff" strokeOpacity="0.05" />
        <rect x={BAY_X[0] + 22} y={BAY_Y + 84} width="18" height="34" rx="3" fill="#1b1f25" />

        {/* Blue connection glow inside the bay (behind the seated drive's edges) */}
        <rect className="bay-glow" x={BAY_X[0] - 16} y={BAY_Y - 16} width={BAY_W + 32} height={BAY_H + 32} rx="20" fill={`url(#blue-${id})`} filter={`url(#soft-${id})`} opacity="0" />

        {/* Occupied bays */}
        {BAY_X.slice(1).map((x) => <Sled key={x} x={x} id={id} />)}

        {/* Power and activity LEDs on the chassis */}
        <circle cx="362" cy="366" r="7" fill="none" stroke="#fff" strokeOpacity="0.35" />
        <circle cx="362" cy="366" r="2.2" fill="#94a3b8" fillOpacity="0.7" />
        <circle className="activity" cx="384" cy="366" r="2.4" fill="#5b86ff" opacity="0" />
        <rect x="614" y="363" width="44" height="5" rx="2.5" fill="#fff" fillOpacity="0.12" />

        {/* Drive shadow (moves with the drive, fades as it goes in) */}
        <ellipse className="hdd-shadow" cx="403" cy="366" rx="40" ry="8" fill="#000" opacity="0.55" filter={`url(#soft-${id})`} />

        {/* The moving drive, drawn seated in bay 0 */}
        <g className="hdd">
          <Sled x={BAY_X[0]} id={id} led="none" />
          <path d={`M${BAY_X[0] + 9} ${BAY_Y + 1} H${BAY_X[0] + BAY_W - 9}`} stroke="#fff" strokeOpacity="0.22" />
          <circle cx={BAY_X[0] + BAY_W / 2} cy={BAY_Y + BAY_H - 12} r="2.6" fill="#94a3b8" fillOpacity="0.45" />
          <circle className="hdd-led" cx={BAY_X[0] + BAY_W / 2} cy={BAY_Y + BAY_H - 12} r="3" fill="#6f95ff" opacity="0" />
          <circle className="hdd-led" cx={BAY_X[0] + BAY_W / 2} cy={BAY_Y + BAY_H - 12} r="9" fill="#3a67ff" opacity="0" filter={`url(#soft-${id})`} />
        </g>
      </svg>
    </div>
  );
}
