import { Globe, Lock, ShieldCheck, Wallet } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';

// Why a NAS, in four short lines, straight after the hero.
const ADVANTAGES = [
  { icon: Wallet, title: 'No monthly fees', body: 'Pay once, unlike cloud plans' },
  { icon: ShieldCheck, title: 'Protected', body: 'RAID survives a drive failure' },
  { icon: Globe, title: 'Anywhere access', body: 'Your files on every device' },
  { icon: Lock, title: 'Private', body: 'Your data stays with you' },
];

export default function NasAdvantages() {
  return (
    <section aria-label="Why a NAS" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 md:pb-16">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {ADVANTAGES.map(({ icon: Icon, title, body }, i) => (
          <Reveal as="li" key={title} delay={i * 70} className="flex flex-col gap-3 rounded-2xl border border-line bg-raised p-4 sm:flex-row sm:items-center sm:p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong"><Icon className="size-5" aria-hidden /></span>
            <div>
              <h3 className="text-base font-bold sm:text-lg">{title}</h3>
              <p className="mt-0.5 text-sm text-muted">{body}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
