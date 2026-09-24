import Reveal from './Reveal.jsx';

export default function SectionHeading({ eyebrow, title, children, align = 'center', as: H = 'h2' }) {
  const centered = align === 'center';
  return (
    <Reveal className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <H className="text-gradient text-3xl font-semibold leading-[1.08] sm:text-4xl lg:text-5xl">{title}</H>
      {children && <p className="mt-6 text-base leading-relaxed text-muted">{children}</p>}
    </Reveal>
  );
}
