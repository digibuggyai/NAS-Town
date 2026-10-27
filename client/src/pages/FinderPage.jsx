import { useState } from 'react';
import Finder from '../components/Finder.jsx';
import PageHero from '../components/PageHero.jsx';
import Savings from '../sections/Savings.jsx';
import Seo from '../components/Seo.jsx';

// Two connected parts: the Finder recommends a NAS, and the savings section below starts from
// that answer (size and top pick) to compare it with cloud storage and external drives.
// /tools/calculator now lands on #roi here.
export default function FinderPage() {
  const [preset, setPreset] = useState(null);
  return (
    <>
      <Seo />
      <PageHero
        eyebrow="NAS Finder & savings"
        title="Find Your NAS & See What You Save"
        intro="Answer three quick questions for a recommendation from our live price list, then see what it costs next to cloud storage and external drives over the years. Not sure how much storage you need? The savings section can estimate it from your files."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <Finder onResult={setPreset} />
      </section>
      <section id="roi" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-28 sm:px-6">
        <p className="eyebrow mb-3">NAS vs cloud vs external drives</p>
        <h2 className="h-section">What it costs over the years</h2>
        <p className="mt-3 mb-8 max-w-2xl text-lg leading-relaxed">A NAS is paid for once. Cloud storage is paid every month, and external drives have no protection when one fails.</p>
        <Savings preset={preset} />
      </section>
    </>
  );
}
