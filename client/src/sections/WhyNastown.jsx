import { Link } from 'react-router';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { why } from '../data/home.js';
import { digibuggy } from '../data/site.js';

export default function WhyNastown() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
        {/* The argument stays in view while the reasons scroll past. */}
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow mb-4">{why.eyebrow}</p>
          <h2 className="h-section">{why.title}</h2>
          <div className="measure mt-5 space-y-2 text-muted">
            {why.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <Link to="/services" className="btn btn-secondary mt-8">{why.cta} <ArrowRight className="size-4" /></Link>

          <div className="mt-10 border-l-2 border-led pl-5">
            <p className="text-[0.95rem]">Prefer to talk it through first?</p>
            <p className="mt-1 text-sm text-muted">
              Message us on{' '}
              <a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="link inline-flex items-center gap-1">
                <MessageCircle className="size-3.5" /> WhatsApp
              </a>{' '}
              or visit the showroom at {digibuggy.addressShort}.
            </p>
          </div>
        </Reveal>

        <ol className="rule-list border-y border-line">
          {why.points.map(({ key, title, body }, i) => (
            <Reveal as="li" key={key} delay={i * 60} className="grid grid-cols-[3.5rem_1fr] gap-4 py-8">
              <span className="mono text-2xl text-subtle">0{i + 1}</span>
              <div>
                <h3 className="text-xl">{title}</h3>
                <p className="mt-2 max-w-md text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
