import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';

// Top of every inner page: eyebrow, the SEO H1 and the intro paragraph.
export default function PageHero({ eyebrow, title, intro, children, aside }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-32 pb-14 sm:px-6 md:pt-40">
      <div className={aside ? 'grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]' : ''}>
        <div className="max-w-3xl">
          {eyebrow && <Reveal y={12}><p className="eyebrow mb-5">{eyebrow}</p></Reveal>}
          <SplitHeading as="h1" immediate delay={0.15} text={title} className="text-3xl sm:text-4xl lg:text-5xl" />
          {intro && <Reveal delay={250} y={20}><p className="mt-6 text-base leading-relaxed text-muted">{intro}</p></Reveal>}
          {children && <Reveal delay={350} y={20} className="mt-8 flex flex-wrap gap-3">{children}</Reveal>}
        </div>
        {aside && <Reveal delay={300}>{aside}</Reveal>}
      </div>
    </section>
  );
}
