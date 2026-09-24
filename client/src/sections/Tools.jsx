import { Link } from 'react-router';
import { ArrowRight, Calculator, SlidersHorizontal } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';

export default function Tools() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeading eyebrow="NAS tools" title="Build Your NAS. Your Way." />
      <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
        <Reveal>
          <div className="glass liquid flex h-full flex-col rounded-[2rem] p-8 sm:p-10">
            <Calculator className="size-7 text-accent" />
            <h3 className="mt-8 text-2xl font-semibold leading-tight">How Much Storage Do You Really Need?</h3>
            <p className="mt-4 text-muted">Get an estimate based on your files, backup needs and future growth.</p>
            <div className="mt-auto pt-10">
              <Link to="/tools/calculator" className="btn btn-glass">Try NAS Calculator <ArrowRight className="size-4" /></Link>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="glass liquid flex h-full flex-col rounded-[2rem] p-8 sm:p-10">
            <SlidersHorizontal className="size-7 text-accent" />
            <h3 className="mt-8 text-2xl font-semibold leading-tight">Build Your NAS.</h3>
            <p className="mt-4 max-w-md text-muted">
              Configure a complete NAS setup based on your exact storage, workload, performance and budget requirements.
            </p>
            {/* Mini preview of the configurator */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['Bays', '4'], ['Drives', '4 × 12 TB'], ['RAID', 'SHR-1'], ['Usable', '≈ 36 TB']].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                  <p className="text-xs text-subtle">{k}</p>
                  <p className="mt-1 font-medium">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-10">
              <Link to="/tools/configurator" className="btn btn-primary">Start Configuring <ArrowRight className="size-4" /></Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
