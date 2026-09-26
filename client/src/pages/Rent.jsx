import PageHero from '../components/PageHero.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import NasVisual from '../components/NasVisual.jsx';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../lib/hooks.js';

const steps = [
  ['Tell us the job', 'Project, capacity and how long you need it.'],
  ['We configure it', 'Drives, RAID and access set up before it reaches you.'],
  ['Use it', 'Full performance, with support included.'],
  ['Return or buy', 'Hand it back, extend, or convert to a purchase.'],
];

export default function Rent() {
  const { data } = useProducts({ rentable: true });
  return (
    <>
      <title>Rent a NAS | NASTOWN</title>
      <PageHero
        eyebrow="Rent a NAS"
        title="Not Ready to Buy? Rent a NAS Instead"
        intro="Need storage for a short-term project, or want to test a setup before committing? Rent a NAS from NASTOWN on flexible terms: full performance, no large upfront investment, and support included."
        aside={<div className="glass rounded-xl p-10"><NasVisual bays={4} className="w-full" /></div>}
      >
        <a href="#rent-form" className="btn btn-primary">Request a Rental</a>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map(([t, b], i) => (
            <Reveal key={t} delay={i * 70} className="glass rounded-xl p-6">
              <span className="font-mono text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-6 text-xl font-medium">{t}</h3>
              <p className="mt-2 text-sm text-muted">{b}</p>
            </Reveal>
          ))}
        </div>
      </section>

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
