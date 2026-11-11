import { useRef } from 'react';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';

export default function CurtainReveal({ children }) {
  const wrap = useRef(null);

  useGSAP(() => {
    const footer = document.querySelector('footer');
    if (reducedMotion() || !footer) return;
    gsap.to(wrap.current.firstElementChild, {
      scale: 0.94,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap.current,
        start: 'bottom bottom',
        end: () => `+=${Math.min(footer.offsetHeight, window.innerHeight)}`,
        scrub: true,
        pin: true,
        pinSpacing: false,
      },
    });
  }, []);

  return <div ref={wrap}>{children}</div>;
}
