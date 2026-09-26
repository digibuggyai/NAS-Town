import { useRef } from 'react';
import { gsap, reducedMotion, SplitText, useGSAP } from '../lib/motion.js';

// Renders `*word*` as the serif-italic accent, e.g. "Your Data Deserves a *Home.*"
export function Accented({ text }) {
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith('*') ? <em key={i} className="accent">{part.slice(1, -1)}</em> : part,
  );
}

// Heading whose lines rise from behind a mask. Used once, for the hero, where an entrance earns its keep.
export default function SplitHeading({ as: H = 'h2', text, className = '', immediate = false, delay = 0 }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    SplitText.create(ref.current, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105,
          duration: 0.9,
          stagger: 0.08,
          delay,
          ease: 'expo.out',
          scrollTrigger: immediate ? undefined : { trigger: ref.current, start: 'top 88%', once: true },
        }),
    });
  }, []);
  return (
    <H ref={ref} className={className || 'heading'}>
      <Accented text={text} />
    </H>
  );
}
