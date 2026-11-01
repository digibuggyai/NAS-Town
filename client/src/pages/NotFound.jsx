import { Link } from 'react-router';
import PageHero from '../components/PageHero.jsx';
import Seo from '../components/Seo.jsx';

const MISSING = 'This page is still being built.';

export default function NotFound({ title = MISSING, intro ="We couldn't find what you were looking for. It may be on its way." }) {
  return (
    <>
      <Seo title={`${title === MISSING ? 'Page not found' : title} | NASTOWN`} description={intro} noindex />
      <PageHero eyebrow="404" title={title} intro={intro}>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
        <Link to="/finder" className="btn btn-secondary">Find My NAS</Link>
      </PageHero>
    </>
  );
}
