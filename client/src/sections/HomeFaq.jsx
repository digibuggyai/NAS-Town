import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { faqs } from '../data/site.js';

// FAQPage structured data so the questions can appear directly in search results.
const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

export default function HomeFaq() {
  return (
    <section id="faq" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28">
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow mb-4">FAQs</p>
          <h2 className="h-section">Frequently Asked Questions</h2>
          <p className="mt-5 text-muted">
            Not covered here? <Link to="/about#contact" className="link">Ask us directly</Link>, or read the{' '}
            <Link to="/resources/faq" className="link">full FAQ</Link>.
          </p>
        </Reveal>
        <Reveal as="div" delay={100} className="rule-list border-y border-line">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-[1.05rem]">
                {q}
                <Plus className="mt-1 size-5 shrink-0 text-subtle transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="measure pb-6 text-muted">{a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
