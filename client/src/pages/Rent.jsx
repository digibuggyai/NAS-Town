import PageHero from '../components/PageHero.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { ClipboardList, PackageCheck, Play, RefreshCw } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import HowItWorks from '../sections/HowItWorks.jsx';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../lib/hooks.js';
import Seo from '../components/Seo.jsx';

const steps = [
  { icon: ClipboardList, title: 'Tell us the job', body: 'Project, capacity and how long you need it.' },
  { icon: PackageCheck, title: 'We configure it', body: 'Drives, RAID and access set up before it reaches you.' },
  { icon: Play, title: 'Use it', body: 'Full performance, with support included.' },
  { icon: RefreshCw, title: 'Return or buy', body: 'Hand it back, extend, or convert to a purchase.' },
];

export default function Rent() {
  const { data } = useProducts({ rentable: true });
  return (
    <>
      <Seo />
      <PageHero
        eyebrow="Rent a NAS"
        title="Not Ready to Buy? Rent a NAS Instead"
        intro="Need storage for a short-term project, or want to test a setup before committing? Rent a NAS from NASTOWN on flexible terms: full performance, no large upfront investment, and support included."
        aside={<div className="glass rounded-xl p-10"><NasVisual bays={4} className="w-full" /></div>}
      >
        <a href="#rent-form" className="btn btn-primary">Request a Rental</a>
      </PageHero>

      <HowItWorks eyebrow="How renting works" title="Four steps, no large upfront cost." steps={steps} />

      <section id="rent-form" className="mx-auto grid max-w-7xl scroll-mt-28 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <h2 className="heading text-3xl">Request a rental</h2>
          <p className="mt-4 text-muted">Tell us about your project and we'll suggest the right system and terms.</p>
          {data?.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow mb-3">Available to rent</p>
              <ul className="grid gap-2">
                {data.map((p) => (
                  <li key={p.slug} className="glass flex items-center justify-between rounded-lg px-4 py-3 text-sm">
                    <span>{p.model}</span><span className="text-muted">{p.bays}-bay</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
        <EnquiryForm
          type="rental"
          submitLabel="Request Rental"
          extra={
            <>
              <label>
                <span className="mb-1.5 block text-sm text-muted">Capacity needed</span>
                <select name="capacity" className="field" defaultValue="">
                  <option value="" disabled>Select</option>
                  <option>Up to 10 TB</option><option>10–20 TB</option><option>20–50 TB</option><option>50 TB+</option>
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm text-muted">Rental period</span>
                <select name="duration" className="field" defaultValue="">
                  <option value="" disabled>Select</option>
                  <option>Under 1 week</option><option>1–4 weeks</option><option>1–3 months</option><option>3 months+</option>
                </select>
              </label>
            </>
          }
        />
      </section>
    </>
  );
}
