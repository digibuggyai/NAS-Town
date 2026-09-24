import { Link } from 'react-router';
import { ArrowRight, Briefcase, Clapperboard, FolderKanban, HardDriveDownload, Image } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import Reveal from '../components/Reveal.jsx';

const sources = [
  { label: 'Photos', icon: Image, where: 'Phone, SD cards' },
  { label: 'Videos', icon: Clapperboard, where: 'External drives' },
  { label: 'Projects', icon: FolderKanban, where: 'Laptop, desktop' },
  { label: 'Business Files', icon: Briefcase, where: 'Office PCs, email' },
  { label: 'Backups', icon: HardDriveDownload, where: 'Cloud accounts' },
];

export default function Problem() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <p className="eyebrow mb-5">The problem</p>
          <h2 className="text-gradient text-3xl leading-[1.08] font-semibold sm:text-4xl lg:text-5xl">
            Your Data Is Growing. Is It in the Right Place?
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted">
            Photos, videos, projects, business files and backups are often scattered across laptops, external drives,
            cloud accounts and office systems. It is time to bring everything together with a NAS.
          </p>
          <Link to="/resources/guides" className="group mt-8 inline-flex items-center gap-2 text-white">
            See How NAS Simplifies Your Digital Life
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Scattered sources flowing into one NAS */}
        <Reveal delay={150} className="relative">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <ul className="grid gap-3">
              {sources.map(({ label, icon: Icon, where }, i) => (
                <li key={label} className="glass liquid flex items-center gap-3 rounded-2xl px-3 py-3 sm:px-4" style={{ transform: `translateX(${[0, 14, 4, 18, 6][i]}px)` }}>
                  <Icon className="size-4 shrink-0 text-accent" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{label}</p>
                    <p className="hidden truncate text-xs text-subtle sm:block">{where}</p>
                  </div>
                </li>
              ))}
            </ul>
            <svg viewBox="0 0 80 300" className="h-72 w-10 sm:w-20" aria-hidden>
              {[30, 90, 150, 210, 270].map((y) => (
                <path
                  key={y}
                  d={`M0 ${y} C 45 ${y}, 35 150, 80 150`}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeOpacity="0.55"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  className="animate-flow"
                />
              ))}
            </svg>
            <div className="glass liquid rounded-3xl p-4 sm:p-6">
              <NasVisual bays={4} className="w-full" />
              <p className="mt-2 text-center text-sm font-medium">One NAS</p>
              <p className="text-center text-xs text-subtle">Everything, in one place</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
