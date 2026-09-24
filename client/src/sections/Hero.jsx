import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import Reveal from '../components/Reveal.jsx';

export default function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-4 pt-32 pb-20 text-center sm:px-6">
      <Reveal>
        <p className="eyebrow">Store&nbsp;&nbsp;•&nbsp;&nbsp;Share&nbsp;&nbsp;•&nbsp;&nbsp;Protect&nbsp;&nbsp;•&nbsp;&nbsp;Grow</p>
      </Reveal>
      <Reveal delay={100}>
        <h1 className="text-gradient mt-6 text-4xl leading-[1.02] font-semibold sm:text-5xl lg:text-6xl">
          Your Data Deserves a&nbsp;Home.
        </h1>
      </Reveal>
      <Reveal delay={200}>
        <p className="mx-auto mt-7 max-w-xl text-base text-muted sm:text-lg">
          Discover, configure and manage the right NAS for the way you work.
        </p>
      </Reveal>
      <Reveal delay={300} className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/finder" className="btn btn-primary">Find My NAS <ArrowRight className="size-4" /></Link>
        <Link to="/tools/configurator" className="btn btn-glass">Build My NAS</Link>
      </Reveal>
      <Reveal delay={380} className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/60">
        <Link to="/solutions/creators" className="hover:text-white">For Creators</Link>
        <span aria-hidden>•</span>
        <Link to="/solutions/business" className="hover:text-white">For Business</Link>
        <span aria-hidden>•</span>
        <Link to="/solutions/home" className="hover:text-white">For Home</Link>
      </Reveal>

      <Reveal delay={450} className="relative mt-16 w-full max-w-3xl">
        {/* Hero product on a glass plinth. Replace NasVisual with real photography when available. */}
        <div className="absolute inset-x-[15%] top-[20%] h-2/3 rounded-full bg-accent/20 blur-[90px]" />
        <div className="glass liquid relative rounded-[2.5rem] px-8 pt-10 pb-4 sm:px-16">
          <NasVisual bays={4} className="mx-auto w-full max-w-md" />
          <div className="mt-2 grid grid-cols-3 divide-x divide-white/10 border-t border-line py-5 text-left text-xs sm:text-sm">
            {[['Private', 'Your cloud, your rules'], ['Protected', 'RAID + snapshots'], ['Anywhere', 'Secure remote access']].map(([k, v]) => (
              <div key={k} className="px-3 sm:px-6">
                <p className="font-medium">{k}</p>
                <p className="mt-0.5 text-muted">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
