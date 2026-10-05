import { useSearchParams } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import Configurator from '../components/configurator/Configurator.jsx';
import Seo from '../components/Seo.jsx';

export default function ConfiguratorPage() {
  const [params] = useSearchParams();
  return (
    <>
      <Seo />
      <PageHero
        eyebrow="NAS Tools · Configurator"
        title="Build Your Perfect NAS Setup"
        intro="Answer a few questions about your use case, budget, and performance needs, and our NAS Configurator will recommend the right system and drive setup for you."
      />
      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6">
        <Configurator source="public" params={params} />
      </section>
    </>
  );
}
