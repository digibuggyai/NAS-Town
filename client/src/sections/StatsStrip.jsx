import { useEffect, useRef, useState } from 'react';
import { stats } from '../config/siteContent.js';
import { reducedMotion } from '../lib/motion.js';

/** "1,200+" → { prefix: '', n: 1200, decimals: 0, suffix: '+' }; null if there's no number in it. */
function parse(value) {
  const m = String(value).match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const digits = m[2].replace(/,/g, '');
  return { prefix: m[1], n: Number(digits), decimals: digits.split('.')[1]?.length ?? 0, grouped: m[2].includes(','), suffix: m[3] };
}

function Counter({ value, run }) {
  const p = parse(value);
  // null = show the value as typed (pre-rendered HTML, reduced motion, finished count).
  const [shown, setShown] = useState(null);
  useEffect(() => { if (p && !reducedMotion()) setShown(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!p || !run) return;
    if (reducedMotion()) { setShown(null); return; }
    let frame;
    const start = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 1400);
      setShown(p.n * (1 - Math.pow(1 - k, 3)));
      if (k < 1) frame = requestAnimationFrame(tick); else setShown(null);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p || shown == null) return value; // the exact text you entered
  const num = p.grouped ? shown.toLocaleString('en-IN', { maximumFractionDigits: p.decimals, minimumFractionDigits: p.decimals }) : shown.toFixed(p.decimals);
  return `${p.prefix}${num}${p.suffix}`;
}

const COLS = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };

/** Four real numbers that count up once when they scroll into view. Hidden until filled in. */
export default function StatsStrip() {
  const filled = stats.filter((s) => String(s.value).trim());
  const ref = useRef(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRun(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (!filled.length) return null;

  return (
    <section aria-label="NASTOWN in numbers" className="border-y border-line bg-surface">
      <dl ref={ref} className={`mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 md:py-12 ${COLS[Math.min(filled.length, 4)]}`}>
        {filled.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="mt-2 text-sm text-muted">{s.label}</dt>
            <dd className="font-display text-[clamp(2rem,4vw,3rem)] leading-none font-semibold tracking-tight text-fg tabular-nums"><Counter value={s.value} run={run} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
