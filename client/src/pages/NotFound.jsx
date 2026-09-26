import { Link } from 'react-router';
import PageHero from '../components/PageHero.jsx';

export default function NotFound({ title = 'This page is still being built.', intro ="We couldn't find what you were looking for. It may be on its way." }) {
  return (
    <>
      <title>Not found | NASTOWN</title>
      <PageHero eyebrow="404" title={title} intro={intro}>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
        <Link to="/finder" className="btn btn-secondary">Find My NAS</Link>
      </PageHero>
    </>
  );
}
