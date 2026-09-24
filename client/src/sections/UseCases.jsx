import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { solutions } from '../data/site.js';

const shown = ['photographers', 'videographers', 'creators', 'business', 'home', 'surveillance'];

export default function UseCases() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <SectionHeading eyebrow="More than one workflow" title="What Are You Building?">
        Whether you are a creator, a business or a home user, we have a NAS solution for you.
      </SectionHeading>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.filter((s) => shown.includes(s.slug)).map(({ slug, name, blurb, icon: Icon }, i) => (
          <Reveal key={slug} delay={i * 60}>
            <Link to={`/solutions/${slug}`} className="glass liquid liquid-lift group flex h-full flex-col rounded-3xl p-7">
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
                  <Icon className="size-5 text-accent" />
                </span>
                <ArrowUpRight className="size-5 text-white/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
              <h3 className="mt-10 text-xl font-medium">{name}</h3>
              <p className="mt-2 text-muted">{blurb}</p>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link to="/solutions/enterprise" className="btn btn-glass">Explore All Solutions <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}
