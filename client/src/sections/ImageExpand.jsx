import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../components/Button.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';

export default function ImageExpand() {
  const wrap = useRef(null);
  const frame = useRef(null);
  const heading = useRef(null);
  const caption = useRef(null);

  useGSAP(() => {
    if (reducedMotion()) return;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: wrap.current, start: 'top top', end: 'bottom bottom', scrub: true },
    });
    tl.fromTo(frame.current, { clipPath: 'inset(34% 34% 34% 34% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1 })
      .fromTo(frame.current.firstElementChild, { scale: 1.25 }, { scale: 1, duration: 1 }, 0)
      .to(heading.current, { opacity: 0, scale: 1.08, duration: 0.45 }, 0.05)
      .fromTo(caption.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, 0.75);
  }, []);

  return (
    <section ref={wrap} aria-label="Storage you own" className="relative h-[230vh] motion-reduce:h-auto">
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-[80svh]">
        <h2
          ref={heading}
          aria-hidden
          className="pointer-events-none absolute inset-0 text-center font-display text-[clamp(2.6rem,9vw,8rem)] leading-[0.95] font-bold tracking-tight text-fg uppercase motion-reduce:hidden"
        >
          <span className="absolute inset-x-0 bottom-[calc(50%+17svh)]">Storage</span>
          <span className="absolute inset-x-0 top-[calc(50%+17svh)] text-accent">you own</span>
        </h2>

        <div ref={frame} className="absolute inset-0 overflow-hidden">
          <img
            src="/images/home/office-1920.webp"
            srcSet="/images/home/office-960.webp 960w, /images/home/office-1920.webp 1920w"
            sizes="100vw"
            alt="A team in an office meeting room, working from shared files"
            width="1920"
            height="1280"
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        </div>

        <div ref={caption} className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-14 sm:px-6 md:pb-20">
          <p className="eyebrow mb-3 !text-white/80">Storage you own</p>
          <h3 className="max-w-3xl font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-tight font-bold tracking-tight !text-white">Your team's files, on your premises, at your network's speed</h3>
          <p className="mt-4 max-w-xl text-lg !text-white/85">One NAS in the office replaces scattered drives and shared cloud folders, with backups and access control built in.</p>
          <div className="mt-6">
            <Button to="/finder">Find your NAS <ArrowRight className="size-4" /></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
