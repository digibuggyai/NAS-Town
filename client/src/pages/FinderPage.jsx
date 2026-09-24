import Finder from '../components/Finder.jsx';
import PageHero from '../components/PageHero.jsx';

export default function FinderPage() {
  return (
    <>
      <title>NAS Finder | NASTOWN</title>
      <PageHero
        eyebrow="Find your perfect NAS"
        title="Not Sure Which NAS You Need?"
        intro="Answer a few simple questions and we will recommend the right NAS for your needs."
      />
      <section className="mx-auto max-w-6xl px-4 pb-28 sm:px-6">
        <Finder />
      </section>
    </>
  );
}
