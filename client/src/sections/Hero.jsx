import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, MessageCircle } from 'lucide-react';
import SplitHeading from '../components/SplitHeading.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { hero } from '../data/home.js';
import { digibuggy } from '../data/site.js';

const facts = [
  ['Prices', 'GST-inclusive, published'],
  ['Setup', 'Installed & configured by our team'],
  ['Showroom', digibuggy.addressShort],
];

// Concave corner joining the headline cut-out to the photo edge (inverted radius).
const Notch = ({ className }) => (
  <span aria-hidden className={`absolute size-7 ${className}`} style={{ background: 'radial-gradient(circle at 100% 0, transparent 28px, #fff 28.5px)' }} />
);

export default function Hero() {
  const root = useRef(null);

  useGSAP(() => {
    if (reducedMotion()) return;
    const tl = gsap.timeline({ paused: true, delay: 0.1 });
    document.fonts.ready.then(() => tl.play());
    tl.from('.hero-photo', { autoAlpha: 0, scale: 1.02, duration: 1 }, 0)
      .from('.hero-card', { autoAlpha: 0, y: 16, duration: 0.7 }, 0.5)
      .from('.hero-fade', { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.08 }, 0.4);
  }, { scope: root });

  return (
    <section ref={root} className="mx-auto max-w-7xl px-4 pt-24 pb-14 sm:px-6 md:pt-28 lg:pb-20">
      {/* Photo with the headline set into a white cut-out at the bottom left, as on the reference. */}
      <div className="hero-photo relative overflow-hidden rounded-[28px]">
        <img
          src="/images/hero/workspace.webp"
          alt="A tidy workspace with a laptop and desktop, the devices a NAS keeps in sync"
          width="1600"
          height="900"
          fetchPriority="high"
          className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:aspect-[16/8]"
        />

        <div className="relative bg-white pt-6 md:absolute md:bottom-0 md:left-0 md:max-w-[62%] md:rounded-tr-[28px] md:pt-7 md:pr-10">
          <Notch className="-top-7 left-0 hidden md:block" />
          <Notch className="-right-7 bottom-0 hidden md:block" />
          <p className="hero-fade eyebrow">{hero.eyebrow}</p>
          <SplitHeading as="h1" immediate delay={0.2} text={hero.title} className="display mt-3" />
        </div>

        {/* Floating card, bottom right. */}
        <div className="hero-card float-card absolute right-4 bottom-4 hidden w-64 p-5 md:block lg:right-6 lg:bottom-6">
          <img src="/digibuggy-bee.png" alt="" className="size-9 rounded-xl bg-accent p-1.5" />
          <p className="mt-3 text-sm leading-relaxed text-body">
            Chosen, installed and supported by our team at {digibuggy.addressShort}.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-16">
        <div>
          <div className="hero-fade max-w-xl space-y-3 text-lg leading-relaxed">
            {hero.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="hero-fade mt-7 flex flex-wrap items-center gap-3">
            <Link to="/finder" className="btn btn-primary">Find My NAS <ArrowRight className="size-4" /></Link>
            <Link to="/tools/configurator" className="btn btn-secondary">Build My NAS</Link>
          </div>
        </div>
        <dl className="hero-fade grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">{k}</dt>
              <dd className="mt-0.5 font-medium text-fg">{v}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs font-semibold tracking-wide text-subtle uppercase">Talk to a person</dt>
            <dd className="mt-0.5">
              <a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="link inline-flex items-center gap-1.5">
                <MessageCircle className="size-4" /> {digibuggy.whatsapp}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
