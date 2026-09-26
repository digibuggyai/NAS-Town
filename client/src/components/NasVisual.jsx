import { useId } from 'react';

// Stylized NAS drawing, used until real product photography is added.
// `bays` sets the number of drive sleds; `shadow` adds a contact shadow; `live` makes the LEDs blink.
export default function NasVisual({ bays = 4, shadow = true, live = false, className = '' }) {
  const id = useId().replace(/:/g, '');
  const cols = Math.min(bays, 5);
  const w = 120 + cols * 70;
  const bayW = 54;
  const gap = 14;
  const start = (w - (cols * bayW + (cols - 1) * gap)) / 2;

  return (
    <svg viewBox={`0 0 ${w} 340`} className={className} role="img" aria-label={`${bays}-bay NAS`}>
      <defs>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2d33" />
          <stop offset="0.45" stopColor="#101114" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
        <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`sled-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1e22" />
          <stop offset="1" stopColor="#0b0c0e" />
        </linearGradient>
        <radialGradient id={`glow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1b1b19" stopOpacity="0.28" />
          <stop offset="1" stopColor="#1b1b19" stopOpacity="0" />
        </radialGradient>
      </defs>

      {shadow && <ellipse cx={w / 2} cy="306" rx={w * 0.46} ry="14" fill={`url(#glow-${id})`} />}

      <rect x="20" y="20" width={w - 40} height="280" rx="26" fill={`url(#body-${id})`} />
      <rect x="20.5" y="20.5" width={w - 41} height="279" rx="25.5" fill="none" stroke={`url(#rim-${id})`} />
      {/* top sheen */}
      <path d={`M46 21 H${w - 46}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />

      {Array.from({ length: cols }).map((_, i) => {
        const x = start + i * (bayW + gap);
        return (
          <g key={i}>
            <rect x={x} y="56" width={bayW} height="196" rx="10" fill={`url(#sled-${id})`} stroke="#fff" strokeOpacity="0.08" />
            {Array.from({ length: 9 }).map((__, j) => (
              <rect key={j} x={x + 12} y={78 + j * 12} width={bayW - 24} height="3" rx="1.5" fill="#fff" fillOpacity="0.06" />
            ))}
            <circle cx={x + bayW / 2} cy="232" r="3.2" fill="var(--color-led)" className={live ? 'animate-blink' : undefined} style={{ animationDelay: `${i * 0.35}s` }} />
          </g>
        );
      })}

      <circle cx="52" cy="276" r="7" fill="none" stroke="#fff" strokeOpacity="0.4" />
      <circle cx="52" cy="276" r="2.2" fill="var(--color-led)" />
      <rect x={w - 96} y="273" width="44" height="5" rx="2.5" fill="#fff" fillOpacity="0.14" />
    </svg>
  );
}
