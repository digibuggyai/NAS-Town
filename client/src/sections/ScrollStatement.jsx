import { useRef } from 'react';
import { gsap, reducedMotion, SplitText, useGSAP } from '../lib/motion.js';

export default function ScrollStatement() {
  const wrap = useRef(null);
  const text = useRef(null);

  useGSAP(() => {
    if (reducedMotion()) return;
    const split = SplitText.create(text.current, { type: 'words' });
    gsap.fromTo(split.words, { opacity: 0.14 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: wrap.current, start: 'top 60%', end: 'bottom bottom', scrub: true },
    });
    return () => split.revert();
  }, []);

  return (
    <section ref={wrap} aria-label="Why own your storage" className="relative h-[170vh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh items-center motion-reduce:static motion-reduce:h-auto motion-reduce:py-20">
        <p ref={text} className="mx-auto max-w-5xl px-4 text-center font-display text-[clamp(1.6rem,4.2vw,3.4rem)] leading-[1.18] font-semibold tracking-tight text-fg sm:px-6">
          A full phone. A monthly cloud bill. A drive in a drawer. <span className="text-accent">Your files deserve better:</span> one NAS, in your home or office, that keeps every file safe, private and yours.
        </p>
      </div>
    </section>
  );
}
