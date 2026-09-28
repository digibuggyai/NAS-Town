import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';

// Closing banner in the reference's format: deep green with soft mint petal
// shapes and one light pill button.
export default function CtaBanner({ title = 'See how NASTOWN fits your life and work', cta = 'Explore NAS Solutions', to = '/solutions', children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 md:pb-24">
      <Reveal className="relative isolate overflow-hidden rounded-[28px] bg-[#0b3d2e] px-6 py-14 text-center sm:px-12 md:py-16">
        {/* Petals: blurred translucent ellipses, purely decorative. */}
        <div aria-hidden className="absolute inset-0 -z-10">
          {[8, 20, 32, 44, 56, 68, 80, 92].map((x, i) => (
            <span
              key={x}
              className="absolute top-1/2 h-[160%] w-[9%] -translate-y-1/2 rounded-[50%] bg-gradient-to-b from-[#a7d6c0]/45 via-[#a7d6c0]/12 to-transparent blur-[1px]"
              style={{ left: `${x}%`, transform: `translateY(-50%) rotate(${(i % 2 ? 1 : -1) * 12}deg)`, opacity: 0.8 - (i % 3) * 0.15 }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e7a5d]/70 via-transparent to-[#1e7a5d]/60" />
        </div>
        <h2 className="mx-auto max-w-2xl font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-tight font-semibold tracking-tight text-[#eaf6f0]">{title}</h2>
        {children && <div className="mx-auto mt-4 max-w-xl text-[#d5ede2]">{children}</div>}
        <Link to={to} className="btn mt-8 border border-[#eaf6f0] bg-[#eaf6f0] text-[#0b3d2e] hover:bg-[#a7d6c0]">
          {cta} <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </section>
  );
}
