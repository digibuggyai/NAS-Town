import { useId, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';

/** One question/answer row. The answer's height is animated with GSAP. */
function Item({ q, a, itemClass, summaryClass, answerClass }) {
  const [open, setOpen] = useState(false);
  const panel = useRef(null);
  const icon = useRef(null);
  const id = useId();
  const first = useRef(true);

  useGSAP(() => {
    if (first.current) { first.current = false; return; } // no animation on mount
    const dur = reducedMotion() ? 0 : 0.45;
    gsap.to(panel.current, { height: open ? 'auto' : 0, duration: dur, ease: 'power3.inOut' });
    gsap.to(panel.current.firstChild, { autoAlpha: open ? 1 : 0, y: open ? 0 : -6, duration: dur * 0.8, ease: 'power2.out', delay: open ? dur * 0.25 : 0 });
    gsap.to(icon.current, { rotate: open ? 45 : 0, duration: dur, ease: 'power3.inOut' });
  }, { dependencies: [open] });

  return (
    <div className={itemClass}>
      <h3 className="!font-sans !text-[inherit] !font-normal !tracking-normal">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full cursor-pointer items-start justify-between gap-6 text-left ${summaryClass}`}
        >
          {q}
          <span ref={icon} className="mt-0.5 inline-flex shrink-0"><Plus className="size-5 text-subtle" /></span>
        </button>
      </h3>
      <div id={id} ref={panel} role="region" className="h-0 overflow-hidden">
        <p className={`invisible opacity-0 ${answerClass}`}>{a}</p>
      </div>
    </div>
  );
}

export default function Accordion({ items, className = '', itemClass = '', summaryClass = 'py-5 text-[1.05rem]', answerClass = 'measure pb-6 text-muted' }) {
  return (
    <div className={className}>
      {items.map(({ q, a }) => (
        <Item key={q} q={q} a={a} itemClass={itemClass} summaryClass={summaryClass} answerClass={answerClass} />
      ))}
    </div>
  );
}
