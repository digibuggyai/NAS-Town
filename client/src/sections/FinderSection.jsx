import Finder from '../components/Finder.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { finder } from '../data/home.js';

export default function FinderSection() {
  return (
    <section id="finder" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28">
      <SectionHeading eyebrow={finder.eyebrow} title={finder.title}>
        {finder.body.map((p) => <p key={p}>{p}</p>)}
      </SectionHeading>
      <Reveal className="mt-12">
        <Finder />
      </Reveal>
    </section>
  );
}
