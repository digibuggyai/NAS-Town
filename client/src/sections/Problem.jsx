import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Briefcase, Clapperboard, FolderKanban, HardDriveDownload, Image } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import Reveal from '../components/Reveal.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import { gsap, reducedMotion, useGSAP } from '../lib/motion.js';
import { problem } from '../data/home.js';

const sources = [
  { label: 'Photos', icon: Image, where: 'Phone, SD cards' },
  { label: 'Videos', icon: Clapperboard, where: 'External drives' },
  { label: 'Projects', icon: FolderKanban, where: 'Laptop, desktop' },
  { label: 'Business Files', icon: Briefcase, where: 'Office PCs, email' },
  { label: 'Backups', icon: HardDriveDownload, where: 'Cloud accounts' },
];
const offsets = [0, 14, 4, 18, 6];

export default function Problem() {
  const diagram = useRef(null);

  // Scattered chips drift into line, the flow lines draw, then the NAS lands.
  useGSAP(() => {
    if (reducedMotion()) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: diagram.current, start: 'top 75%', once: true } });
    tl.from('.src-chip', {
      autoAlpha: 0,
      x: () => gsap.utils.random(-120, -40),
      y: () => gsap.utils.random(-40, 40),
      rotation: () => gsap.utils.random(-8, 8),
      duration: 1.4,
      stagger: 0.09,
    })
      .from('.flow-path', { autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.5)
      .from('.one-nas', { autoAlpha: 0, scale: 0.85, x: 30, duration: 1.4 }, 0.7);
  }, { scope: diagram });

  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <Reveal y={12}><p className="eyebrow mb-5">{problem.eyebrow}</p></Reveal>
          <SplitHeading text={problem.title} className="text-3xl sm:text-4xl lg:text-5xl" />
          <Reveal delay={150} y={20}>
            <div className="mt-6 space-y-3 text-base leading-relaxed text-muted">
              {problem.body.map((p, i) => (
                <p key={p} className={i === problem.body.length - 1 ? 'text-white/90' : ''}>{p}</p>
              ))}
            </div>
            <Link to="/#what-is-nas" className="group mt-8 inline-flex items-center gap-2 text-white">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                {problem.cta}
              </span>
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div ref={diagram} className="relative">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <ul className="grid gap-3">
              {sources.map(({ label, icon: Icon, where }, i) => (
                <li key={label} className="src-chip glass liquid flex items-center gap-3 rounded-2xl px-3 py-3 sm:px-4" style={{ marginLeft: offsets[i] }}>
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
                  className="flow-path animate-flow"
                />
              ))}
            </svg>
            <div className="one-nas tilt glass liquid rounded-3xl p-4 sm:p-6">
              <NasVisual bays={4} className="w-full" />
              <p className="mt-2 text-center text-sm font-medium">One NAS</p>
              <p className="text-center text-xs text-subtle">Everything, in one place</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
