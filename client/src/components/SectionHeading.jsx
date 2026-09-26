import Reveal from './Reveal.jsx';
import { Accented } from './SplitHeading.jsx';

/** Section label + heading + optional intro. Left-aligned by default: most content reads better that way. */
export default function SectionHeading({ eyebrow, title, children, align = 'left', as: H = 'h2', className = '' }) {
  const centered = align === 'center';
  return (
    <Reveal className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''} ${className}`}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <H className="h-section"><Accented text={title} /></H>
      {children && <div className={`mt-5 space-y-2 text-muted ${centered ? 'mx-auto max-w-xl' : 'measure'}`}>{children}</div>}
    </Reveal>
  );
}
