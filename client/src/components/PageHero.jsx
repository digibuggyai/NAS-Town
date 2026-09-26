import Reveal from './Reveal.jsx';
import { Accented } from './SplitHeading.jsx';

// Top of every inner page: label, the SEO H1 and the intro, left-aligned on a rule.
export default function PageHero({ eyebrow, title, intro, children, aside }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 md:pt-36 md:pb-16">
      <div className={aside ? 'grid items-start gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16' : ''}>
        <Reveal className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <h1 className="heading text-[2.25rem] sm:text-5xl lg:text-[3.5rem]"><Accented text={title} /></h1>
          {intro && <p className="lede mt-6">{intro}</p>}
          {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
        </Reveal>
        {aside && <Reveal delay={120}>{aside}</Reveal>}
      </div>
    </section>
  );
}
