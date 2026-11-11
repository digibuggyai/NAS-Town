import { useRef } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { solutions } from '../data/home.js';

const STACK_TOP = 96;
const STACK_STEP = 18;

export default function Solutions() {
  const list = useRef(null);

  useGSAP(() => {
    if (reducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const cards = gsap.utils.toArray(list.current.children);
      cards.slice(0, -1).forEach((card, i) => {
        gsap.to(card.firstElementChild, {
          scale: 0.94,
          opacity: 0.55,
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: `top ${STACK_TOP + (i + 1) * STACK_STEP}px`,
            scrub: true,
          },
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">{solutions.eyebrow}</p>
            <h2 className="h-section">{solutions.title}</h2>
            {solutions.body.map((p) => <p key={p} className="mt-4 text-lg leading-relaxed">{p}</p>)}
          </div>
          <Link to="/solutions" className="link inline-flex items-center gap-1">
            {solutions.cta} <ChevronRight className="size-4" />
          </Link>
        </Reveal>

        <div ref={list} className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 md:block md:pb-6">
          {solutions.cards.map(({ slug, title, body, setup, cta, image, alt }, i) => (
            <div
              key={slug}
              className="md:sticky md:top-[var(--stack-top)] md:mb-[12vh] md:last:mb-0"
              style={{ '--stack-top': `${STACK_TOP + i * STACK_STEP}px` }}
            >
              <Link
                to={`/solutions/${slug}`}
                className="group block origin-top md:grid md:h-[min(68svh,520px)] md:grid-cols-[1.1fr_1fr] md:overflow-hidden md:rounded-[28px] md:border md:border-line md:bg-raised md:shadow-[0_30px_60px_-40px_rgb(15_23_42/0.45)]"
              >
                <div className="overflow-hidden rounded-[20px] bg-white md:rounded-none">
                  <img
                    src={image}
                    srcSet={`${image.replace('.webp', '-480.webp')} 480w, ${image} 800w`}
                    sizes="(min-width: 768px) 55vw, (min-width: 640px) 46vw, 92vw"
                    alt={alt}
                    width="800"
                    height="600"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03] md:aspect-auto md:h-full"
                  />
                </div>
                <div className="md:flex md:flex-col md:justify-center md:p-10 lg:p-14">
                  <p className="mono mt-5 hidden text-sm font-semibold text-accent md:mt-0 md:block">0{i + 1} / 0{solutions.cards.length}</p>
                  <h3 className="mt-5 text-xl md:mt-3 md:font-display md:text-3xl md:font-bold md:tracking-tight">NAS for {title}</h3>
                  <p className="mt-2 leading-relaxed md:text-lg">{body}</p>
                  <p className="mono mt-3 text-sm text-subtle">
                    <span className="font-medium text-muted">Typical setup:</span> {setup}
                  </p>
                  <span className="link mt-4 inline-flex items-center gap-1 md:mt-6">
                    {cta} <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
