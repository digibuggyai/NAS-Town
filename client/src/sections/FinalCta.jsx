import { Link } from 'react-router';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { Accented } from '../components/SplitHeading.jsx';
import { finalCta } from '../data/home.js';
import { digibuggy } from '../data/site.js';

export default function FinalCta({ eyebrow = finalCta.eyebrow, title = finalCta.title, body = finalCta.body }) {
  const lines = Array.isArray(body) ? body : [body];
  return (
    <section className="theme-dark border-b border-line">
      <Reveal className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h2 className="h-section"><Accented text={title} /></h2>
          <div className="measure mt-5 space-y-1 text-muted">
            {lines.map((l) => <p key={l}>{l}</p>)}
          </div>
        </div>
        <div className="grid gap-3 sm:max-w-sm lg:justify-self-end">
          <Link to="/finder" className="btn btn-primary">Find My NAS <ArrowRight className="size-4" /></Link>
          <Link to="/about#contact" className="btn btn-secondary">Talk to an Expert</Link>
          <a href={digibuggy.whatsappHref} target="_blank" rel="noopener" className="mt-1 inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-fg">
            <MessageCircle className="size-4" /> or WhatsApp {digibuggy.whatsapp}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
