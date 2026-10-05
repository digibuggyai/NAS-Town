import { Link } from 'react-router';
import Reveal from '../components/Reveal.jsx';
import Accordion from '../components/Accordion.jsx';
import { faqs } from '../data/site.js';

// The five questions buyers ask first; the rest live on the FAQ page.
const top = faqs.slice(0, 5);

// FAQ structured data lives on the full FAQ page (lib/seo.js), not here: Google wants it on one page only.

export default function HomeFaq() {
  return (
    <section id="faq" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow mb-4">FAQs</p>
          <h2 className="h-section">Frequently Asked Questions</h2>
          <p className="mt-5 text-muted">
            Not covered here? <Link to="/about#contact" className="link">Ask us directly</Link>, or read the{' '}
            <Link to="/resources/faq" className="link">full FAQ</Link>.
          </p>
        </Reveal>
        <Reveal as="div" delay={100}>
          <Accordion items={top} className="rule-list border-y border-line" />
        </Reveal>
      </div>
    </section>
  );
}
