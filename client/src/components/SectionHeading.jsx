import Reveal from './Reveal.jsx';
import SplitHeading from './SplitHeading.jsx';

export default function SectionHeading({ eyebrow, title, children, align = 'center', as = 'h2' }) {
  const centered = align === 'center';
  return (
    <div className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <Reveal y={12}><p className="eyebrow mb-5">{eyebrow}</p></Reveal>}
      <SplitHeading as={as} text={title} className="text-3xl sm:text-4xl lg:text-[3.25rem]" />
      {children && (
        <Reveal delay={150} y={20}>
          <p className={`mt-6 text-base leading-relaxed text-muted ${centered ? 'mx-auto max-w-xl' : ''}`}>{children}</p>
        </Reveal>
      )}
    </div>
  );
}
