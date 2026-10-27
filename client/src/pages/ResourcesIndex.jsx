import { Link } from 'react-router';
import { ArrowUpRight, BookOpen, FileQuestion, GitCompareArrows, ListChecks, Newspaper, Star } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import Reveal from '../components/Reveal.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { resources } from '../data/site.js';
import Seo from '../components/Seo.jsx';
import ConfiguratorBand from '../components/ConfiguratorBand.jsx';

const ICONS = { guides: BookOpen, comparisons: GitCompareArrows, reviews: Star, 'how-to': ListChecks, blog: Newspaper, faq: FileQuestion };

// Hub for everything that used to sit in the Resources dropdown.
export default function ResourcesIndex() {
  return (
    <>
      <Seo />
      <PageHero
        eyebrow="Resources"
        title="Learn NAS, at Your Own Pace"
        intro="Guides, comparisons, how-tos and answers to the questions people ask us most, from choosing your first NAS to keeping it healthy for years."
      />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 md:pb-28">
        {resources.map((r, i) => {
          const Icon = ICONS[r.slug] ?? BookOpen;
          return (
            <Reveal key={r.slug} delay={(i % 3) * 80}>
              <Link to={`/resources/${r.slug}`} className="group glass flex h-full flex-col rounded-xl p-6 transition-colors hover:border-accent/40">
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-strong"><Icon className="size-5" aria-hidden /></span>
                  <ArrowUpRight className="size-5 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" aria-hidden />
                </div>
                <h2 className="mt-6 text-xl font-bold">{r.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.intro}</p>
              </Link>
            </Reveal>
          );
        })}
      </section>
      <ConfiguratorBand className="pb-16" />
      <FinalCta />
    </>
  );
}
