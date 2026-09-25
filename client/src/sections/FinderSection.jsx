import Finder from '../components/Finder.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';

export default function FinderSection() {
  return (
    <section id="finder" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-28 sm:px-6">
      <SectionHeading eyebrow="Find your perfect NAS" title="Not Sure Which *NAS You Need?*">
        Answer a few simple questions and we will recommend the right NAS for your needs.
      </SectionHeading>
      <Reveal className="mt-14">
        <Finder />
      </Reveal>
    </section>
  );
}
