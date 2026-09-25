import { useRef } from 'react';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';

// Fades and rises its content into place when it scrolls into view.
export default function Reveal({ as: Tag = 'div', delay = 0, y = 36, className = '', children, ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    gsap.from(ref.current, {
      autoAlpha: 0,
      y,
      filter: 'blur(8px)',
      duration: 1.3,
      delay: delay / 1000,
      clearProps: 'filter',
      scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
    });
  }, []);
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
