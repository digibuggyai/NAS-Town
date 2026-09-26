import { ArrowUpRight, Star } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { digibuggy } from '../data/site.js';

const Stars = ({ size = 'size-4', label }) => (
  <span className="flex gap-0.5 text-fg" aria-label={label}>
    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${size} fill-current`} strokeWidth={0} />)}
  </span>
);

// Google rating for Digibuggy, plus NAS reviews quoted word for word once they exist.
export default function Reviews() {
  const g = digibuggy.google;
  const hasReviews = g.reviews.length > 0;

  const rating = (
    <div>
      <p className="eyebrow mb-4">Reviews on Google</p>
      <p className="flex items-baseline gap-3">
        <span className="text-6xl font-medium tracking-tight">{g.rating.toFixed(1)}</span>
        <Stars label={`${g.rating} out of 5 stars`} />
      </p>
      <p className="mt-3 text-muted">From {g.count} Google reviews of Digibuggy, the team behind NASTOWN.</p>
      <a href={g.href} target="_blank" rel="noopener" className="link mt-6 inline-flex items-center gap-1.5 text-[0.95rem]">
        Read them on Google <ArrowUpRight className="size-4" />
      </a>
    </div>
  );

  if (!hasReviews) {
    return (
      <section className="bg-surface">
        <Reveal className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.4fr] lg:items-end lg:gap-16">
          {rating}
          <div className="border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <p className="text-xl leading-snug">Bought a NAS from us?</p>
            <p className="mt-2 max-w-md text-muted">
              Tell others how it's going. A short Google review helps people choosing their first NAS.
            </p>
            <a href={g.href} target="_blank" rel="noopener" className="btn btn-secondary mt-5">
              Leave a review <ArrowUpRight className="size-4" />
            </a>
          </div>
        </Reveal>
      </section>
    );
  }

  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <Reveal>{rating}</Reveal>
        <div className="grid gap-8 md:grid-cols-2">
          {g.reviews.map((r, i) => (
            <Reveal as="figure" key={r.name} delay={i * 100} className="flex flex-col border-t border-fg pt-5">
              <Stars size="size-3.5" label="5 out of 5 stars" />
              <blockquote className="mt-4 text-[1.05rem] leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-auto pt-5 text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="mono mt-0.5 block text-xs text-subtle">Google review{r.context ? ` · ${r.context}` : ''}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
