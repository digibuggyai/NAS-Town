import { Accented } from '../components/SplitHeading.jsx';
import CtaBanner from './CtaBanner.jsx';
import { finalCta } from '../data/home.js';

// Closing call to action on inner pages, in the blue banner style.
export default function FinalCta({ title = finalCta.title, body = finalCta.body }) {
  const lines = Array.isArray(body) ? body : [body];
  return (
    <CtaBanner title={<Accented text={title} />} cta="Find My NAS" to="/finder">
      {lines.map((l) => <p key={l}>{l}</p>)}
    </CtaBanner>
  );
}
