import { Camera, Building, Clapperboard, Quote } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';

// The brief says: use only verified numbers, logos, testimonials and deployment stats.
// These are layout slots until real case studies are supplied; nothing here is a claim.
const slots = [
  { icon: Camera, kind: 'Case study', title: 'Photography studio', body: 'How a studio moved its RAW archive off external drives onto one protected NAS.' },
  { icon: Building, kind: 'Case study', title: 'Business centralized storage', body: 'One secure file server replacing scattered shared drives and ad-hoc backups.' },
  { icon: Clapperboard, kind: 'Case study', title: 'Creator video workflow', body: 'Editing 4K timelines directly off a 10GbE NAS.' },
];

export default function Stories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeading eyebrow="Built for real work" title="Real People. Real Workflows." />
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {slots.map(({ icon: Icon, kind, title, body }, i) => (
          <Reveal key={title} delay={i * 80}>
            <article className="glass liquid flex h-full flex-col rounded-[2rem] p-8">
              <div className="flex items-center justify-between">
                <span className="eyebrow !text-[0.65rem]">{kind}</span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[0.7rem] text-subtle ring-1 ring-white/10">Coming soon</span>
              </div>
              <Icon className="mt-10 size-7 text-accent" />
              <h3 className="mt-5 text-xl font-medium">{title}</h3>
              <p className="mt-3 text-muted">{body}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-5">
        <div className="glass flex flex-col items-start gap-4 rounded-[2rem] p-8 sm:flex-row sm:items-center">
          <Quote className="size-8 shrink-0 text-white/25" />
          <p className="text-base text-muted">Verified customer testimonials will appear here.</p>
        </div>
      </Reveal>
    </section>
  );
}
