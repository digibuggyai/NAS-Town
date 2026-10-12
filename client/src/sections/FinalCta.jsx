import { MessageCircle } from 'lucide-react';
import { Accented } from '../components/SplitHeading.jsx';
import CtaBanner from './CtaBanner.jsx';
import { finalCta } from '../data/home.js';
import { waLink } from '../data/site.js';
import { quoteText } from '../config/siteContent.js';

// Closing call to action on inner pages, in the blue banner style.
export default function FinalCta({ title = finalCta.title, body = finalCta.body }) {
  const lines = Array.isArray(body) ? body : [body];
  return (
    <CtaBanner title={<Accented text={title} />} cta={<><MessageCircle className="size-4" /> Get a free quote on WhatsApp</>} href={waLink(quoteText)}>
      {lines.map((l) => <p key={l}>{l}</p>)}
    </CtaBanner>
  );
}
