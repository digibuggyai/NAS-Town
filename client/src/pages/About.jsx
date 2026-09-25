import { digibuggy } from '../data/site.js';
import { Headset, ShieldCheck, Wrench } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import Reveal from '../components/Reveal.jsx';

const values = [
  { icon: ShieldCheck, title: 'Choose right', body: 'Honest recommendations across brands, matched to how you actually work.' },
  { icon: Wrench, title: 'Set up right', body: 'Installation, RAID and migration handled by people who do it every day.' },
  { icon: Headset, title: 'Stay supported', body: 'Remote and on-site support, repairs and AMC plans for years of reliable storage.' },
];

export default function About() {
  return (
    <>
      <title>About & Contact | NASTOWN</title>
      <PageHero
        eyebrow="About NASTOWN"
        title="About NASTOWN"
        intro="NASTOWN was built to make NAS storage simple, from choosing the right system to keeping it running smoothly for years. Backed by Digibuggy's hardware expertise, we combine product knowledge with hands-on service so you're never left figuring it out alone."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80} className="glass liquid rounded-[2rem] p-8">
              <Icon className="size-7 text-accent" />
              <h2 className="mt-8 text-xl font-medium">{title}</h2>
              <p className="mt-3 text-muted">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto grid max-w-7xl scroll-mt-28 gap-10 px-4 py-16 pb-28 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <p className="eyebrow mb-5">Contact</p>
          <h2 className="heading text-3xl sm:text-4xl">Let's talk storage.</h2>
          <p className="mt-5 text-base text-muted">Have a question or need a custom recommendation? Get in touch with our team.</p>
          <div className="glass mt-8 rounded-3xl p-6">
            <a href={digibuggy.site} target="_blank" rel="noopener" className="inline-block">
              <img src="/digibuggy-logo.svg" alt="Digibuggy" width="218" height="25" className="h-5 w-auto" />
            </a>
            <p className="mt-3 text-sm text-muted">NASTOWN is backed by Digibuggy, custom PC and storage builders in Nehru Place, New Delhi.</p>
            <dl className="mt-5 grid gap-2 text-sm">
              <div className="flex gap-3"><dt className="w-20 text-subtle">Email</dt><dd><a href={`mailto:${digibuggy.email}`} className="hover:text-accent">{digibuggy.email}</a></dd></div>
              <div className="flex gap-3"><dt className="w-20 text-subtle">WhatsApp</dt><dd><a href={digibuggy.socials[0].href} target="_blank" rel="noopener" className="hover:text-accent">{digibuggy.whatsapp}</a></dd></div>
            </dl>
          </div>
        </Reveal>
        <EnquiryForm type="contact" />
      </section>
    </>
  );
}
