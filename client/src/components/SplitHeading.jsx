import { useRef } from 'react';
import { gsap, reducedMotion, SplitText, useGSAP } from '../lib/motion.js';

// Renders `*word*` as the serif-italic accent, e.g. "Your Data Deserves a *Home.*"
export function Accented({ text }) {
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith('*') ? <em key={i} className="accent">{part.slice(1, -1)}</em> : part,
  );
}

// Heading whose lines slide up from behind a mask, on load (`immediate`) or on scroll.
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
          yPercent: 110,
          rotate: 2,
          duration: 1.4,
          stagger: 0.1,
          delay,
          ease: 'expo.out',
          scrollTrigger: immediate ? undefined : { trigger: ref.current, start: 'top 88%', once: true },
        }),
    });
  }, []);
  return (
    <H ref={ref} className={`heading ${className}`}>
      <Accented text={text} />
    </H>
  );
}
