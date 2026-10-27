import { Link } from 'react-router';
import { ArrowRight, Boxes, HardDrive, ReceiptIndianRupee, Wrench } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';

const STEPS = [
  { icon: Boxes, title: 'Pick a box', body: 'Tell it how much storage you need, or your budget. It suggests the unit; change it if you like.' },
  { icon: HardDrive, title: 'Pick drives & RAID', body: 'Drives and the RAID level are matched to your size. Choose your own if you prefer.' },
  { icon: Wrench, title: 'Add installation or AMC', body: 'On-site setup (Delhi NCR only) and an annual maintenance plan, ticked or not, priced per unit.' },
];

/** The configurator is the main way to get a price, so the homepage gives it its own section. */
export default function BuildYourNas() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
        <Reveal>
          <p className="eyebrow mb-3">NAS Configurator</p>
          <h2 className="h-section">Build your NAS in 3 steps</h2>
          <ol className="mt-8 grid gap-6">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-strong"><Icon className="size-5" aria-hidden /></span>
                <div>
                  <h3 className="text-lg font-bold"><span className="mono mr-2 text-xs font-normal text-subtle">0{i + 1}</span>{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-white"><ReceiptIndianRupee className="size-5" aria-hidden /></span>
              <div>
                <h3 className="text-lg font-bold">Instant, GST-inclusive quote</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">The full price as you go, from our live price list. Download it as a PDF or request a formal quotation.</p>
              </div>
            </li>
          </ol>
          <Button to="/tools/configurator" className="mt-9">Build your NAS <ArrowRight className="size-4" /></Button>
        </Reveal>

        {/* A real screenshot of the configurator (20 TB, RAID 5, with installation). */}
        <Reveal delay={120}>
          <Link to="/tools/configurator" className="group block overflow-hidden rounded-[20px] border border-line bg-surface shadow-[0_30px_60px_-34px_rgb(15_23_42/0.45)]" aria-label="Open the NAS configurator">
            <img
              src="/images/configurator/preview-1248.webp"
              srcSet="/images/configurator/preview-720.webp 720w, /images/configurator/preview-1248.webp 1248w"
              sizes="(min-width: 1024px) 720px, 100vw"
              width="1248"
              height="660"
              loading="lazy"
              decoding="async"
              alt="The NASTOWN configurator: 20 TB at RAID 5 on a QNAP TS-433-4G with three 10 TB drives and installation, ₹2,01,440 including GST"
              className="w-full transition-transform duration-500 ease-out group-hover:scale-[1.015]"
            />
          </Link>
          <p className="mt-3 text-xs text-subtle">The configurator, with a 20 TB build. Prices shown are from our price list on 8 October 2026.</p>
        </Reveal>
      </div>
    </section>
  );
}
