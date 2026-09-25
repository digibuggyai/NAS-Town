import Finder from '../components/Finder.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { finder } from '../data/home.js';

export default function FinderSection() {
  return (
    <section id="finder" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-28 sm:px-6">
      <SectionHeading eyebrow={finder.eyebrow} title={finder.title}>
        {finder.body.map((p) => <span key={p} className="block [&+&]:mt-2">{p}</span>)}
      </SectionHeading>
      <Reveal className="mt-14">
        <Finder />
      </Reveal>
    </section>
  );
}
