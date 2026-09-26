import { useRef } from 'react';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';

// Content settles into place the first time it scrolls into view. Short and quiet.
export default function Reveal({ as: Tag = 'div', delay = 0, y = 16, className = '', children, ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    gsap.from(ref.current, {
      autoAlpha: 0,
      y,
      duration: 0.7,
      delay: delay / 1000,
      scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true },
    });
  }, []);
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
