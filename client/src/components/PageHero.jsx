import Reveal from './Reveal.jsx';

// Top of every inner page: eyebrow, the SEO H1 and the intro paragraph.
export default function PageHero({ eyebrow, title, intro, children, aside }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-32 pb-14 sm:px-6 md:pt-36">
      <div className={aside ? 'grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]' : ''}>
        <Reveal className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <h1 className="text-gradient text-3xl font-semibold leading-[1.08] sm:text-4xl lg:text-5xl">{title}</h1>
          {intro && <p className="mt-6 text-base leading-relaxed text-muted">{intro}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </Reveal>
        {aside && <Reveal delay={150}>{aside}</Reveal>}
      </div>
    </section>
  );
}
