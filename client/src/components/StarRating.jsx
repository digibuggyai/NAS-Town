import { Star } from 'lucide-react';

/** Read-only stars, e.g. 4 of 5 filled. */
export function Stars({ value, size = 'size-4' }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? 'fill-current text-star' : 'text-line-strong'}`} strokeWidth={i <= Math.round(value) ? 0 : 1.5} />
      ))}
    </span>
  );
}

/** Pick 1–5 stars. A real radio group, so it works with the keyboard and screen readers. */
export function StarInput({ value, onChange, name = 'rating' }) {
  return (
    <div role="radiogroup" aria-label="Your rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <label key={i} className="cursor-pointer rounded-md p-0.5 focus-within:outline-2 focus-within:outline-accent">
          <input type="radio" name={name} value={i} checked={value === i} onChange={() => onChange(i)} className="sr-only" aria-label={`${i} star${i > 1 ? 's' : ''}`} />
          <Star className={`size-8 transition-colors ${i <= value ? 'fill-current text-star' : 'text-line-strong hover:text-star'}`} strokeWidth={i <= value ? 0 : 1.5} />
        </label>
      ))}
    </div>
  );
}
