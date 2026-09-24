import { Link } from 'react-router';
import { ArrowRight, BookOpen, GitCompareArrows, Hammer } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';

const pillars = [
  { icon: BookOpen, title: 'Understand', body: 'NAS basics, storage concepts, RAID and backup fundamentals.', to: '/resources/guides' },
  { icon: GitCompareArrows, title: 'Compare', body: 'Brand, model, capacity and RAID comparisons.', to: '/resources/comparisons' },
  { icon: Hammer, title: 'Build', body: 'Practical guides for photographers, creators, businesses and home users.', to: '/resources/how-to' },
];

export default function Knowledge() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeading eyebrow="The NAS Library" title="Learn. Compare. Build.">
        Everything you need to understand, choose and get more from your storage.
      </SectionHeading>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {pillars.map(({ icon: Icon, title, body, to }, i) => (
          <Reveal key={title} delay={i * 80}>
            <Link to={to} className="glass liquid liquid-lift group flex h-full flex-col rounded-[2rem] p-8">
              <span className="font-mono text-sm text-subtle">0{i + 1}</span>
              <Icon className="mt-10 size-8 text-accent" />
              <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-muted">{body}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm text-white/70 group-hover:text-white">
                Read more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link to="/resources/guides" className="btn btn-glass">Explore the NAS Library <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}
