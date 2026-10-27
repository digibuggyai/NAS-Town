import { ClipboardList, Headset, Calculator, Wrench } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';

const STEPS = [
  { icon: ClipboardList, title: 'Tell us your needs', body: 'Answer three questions in the NAS Finder, or just message us on WhatsApp.' },
  { icon: Calculator, title: 'We recommend & quote', body: 'A configuration that fits, priced in the configurator with GST included.' },
  { icon: Wrench, title: 'We install & set up', body: 'Drives, RAID, backups and secure remote access, configured by our team.' },
  { icon: Headset, title: 'We support you', body: 'AMC plans, remote help and on-site visits for as long as you run it.' },
];

/** Four steps joined by a line. Used on the homepage and Services page; Rent passes its own `steps`. */
export default function HowItWorks({ eyebrow = 'How it works', title = 'From question to running NAS', steps = STEPS, className = '' }) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 ${className}`}>
      <Reveal className="max-w-2xl">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="h-section">{title}</h2>
      </Reveal>
      <div className="relative mt-10">
        {/* The connecting line: across on desktop, down the side on phones. */}
        <span aria-hidden className="absolute top-6 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-accent/50 via-accent/30 to-accent/50 md:block" />
        <span aria-hidden className="absolute top-6 bottom-6 left-6 w-px bg-gradient-to-b from-accent/50 to-accent/20 md:hidden" />
      <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
        {steps.map(({ icon: Icon, title: t, body }, i) => (
          <Reveal as="li" key={t} delay={i * 90} className="relative grid grid-cols-[3rem_1fr] gap-4 md:block md:text-center">
            <span className="relative z-10 grid size-12 place-items-center rounded-full bg-raised text-accent ring-1 ring-accent/40 shadow-[0_6px_16px_-10px_rgb(58_103_255/0.6)] md:mx-auto">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="mono mt-1 text-xs text-subtle md:mt-4">Step {i + 1}</p>
              <h3 className="mt-1 text-lg font-bold">{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted md:mx-auto md:max-w-56">{body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
      </div>
    </section>
  );
}
