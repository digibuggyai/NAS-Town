import { Link } from 'react-router';
import { ChevronDown } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { faqs } from '../data/site.js';

// FAQPage structured data so the questions can appear directly in search results.
const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

export default function HomeFaq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-28 sm:px-6">
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <SectionHeading eyebrow="FAQs" title="Frequently Asked *Questions*" />
      <div className="mt-12 grid gap-3">
        {faqs.map(({ q, a }, i) => (
          <Reveal key={q} delay={i * 40} y={16}>
            <details className="glass liquid group rounded-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium">
                {q}
                <ChevronDown className="size-5 shrink-0 text-white/60 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-muted">{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-muted">
        More questions? <Link to="/resources/faq" className="text-white underline-offset-4 hover:underline">See all FAQs</Link> or{' '}
        <Link to="/about#contact" className="text-white underline-offset-4 hover:underline">talk to our team</Link>.
      </p>
    </section>
  );
}
