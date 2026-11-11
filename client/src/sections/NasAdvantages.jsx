import { useRef, useState } from 'react';
import { Globe, Lock, ShieldCheck, Wallet } from 'lucide-react';
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from '../lib/motion.js';

const ADVANTAGES = [
  { icon: Wallet, title: 'No monthly fees', body: 'Pay once, unlike cloud plans', detail: 'Cloud plans charge every month for as long as you store. A NAS is paid for once, and the hardware and drives are yours.', tint: 'from-[#e8eeff] to-[#c9d6ff]' },
  { icon: ShieldCheck, title: 'Protected', body: 'RAID survives a drive failure', detail: 'With RAID, your files stay available when a drive fails. Replace the drive and the NAS rebuilds itself.', tint: 'from-[#e6f6ef] to-[#c3ead8]' },
  { icon: Globe, title: 'Anywhere access', body: 'Your files on every device', detail: 'Open, share and sync files from your phone, laptop or browser, at home, in the office or on a shoot.', tint: 'from-[#eef3ff] to-[#d6e2ff]' },
  { icon: Lock, title: 'Private', body: 'Your data stays with you', detail: "Your data stays on your premises, behind your own passwords, not on someone else's server.", tint: 'from-[#f1edff] to-[#ddd3ff]' },
];

export default function NasAdvantages() {
  const wrap = useRef(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useGSAP(() => {
    if (reducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      setPinned(true);
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => setActive(Math.min(ADVANTAGES.length - 1, Math.floor(self.progress * ADVANTAGES.length))),
      });
      return () => { st.kill(); setPinned(false); setActive(0); };
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={wrap} aria-label="Why a NAS" className={pinned ? 'relative h-[320vh]' : 'relative'}>
      <div className={pinned ? 'sticky top-0 flex h-svh items-center' : ''}>
        <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${pinned ? 'grid grid-cols-2 items-center gap-16' : 'pb-14 md:pb-16'}`}>
          <div>
            {pinned && (
              <>
                <p className="eyebrow mb-3">Why a NAS</p>
                <h2 className="h-section mb-10">Four reasons to own your storage</h2>
              </>
            )}
            <ul className={pinned ? 'grid gap-7' : 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'}>
              {ADVANTAGES.map(({ icon: Icon, title, body }, i) => {
                const on = !pinned || i === active;
                return (
                  <li
                    key={title}
                    className={pinned
                      ? `flex items-start gap-5 transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-25'}`
                      : 'flex flex-col gap-3 rounded-2xl border border-line bg-raised p-4 sm:flex-row sm:items-center sm:p-5'}
                  >
                    {pinned
                      ? <span className={`mono pt-1.5 text-sm font-semibold ${on ? 'text-accent' : 'text-subtle'}`}>(0{i + 1})</span>
                      : <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong"><Icon className="size-5" aria-hidden /></span>}
                    <div>
                      <h3 className={pinned ? 'font-display text-3xl font-bold tracking-tight' : 'text-base font-bold sm:text-lg'}>{title}</h3>
                      <p className={pinned ? 'mt-1 text-lg text-muted' : 'mt-0.5 text-sm text-muted'}>{body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {pinned && (
            <div className="relative aspect-[4/5] max-h-[72svh] w-full justify-self-end">
              {ADVANTAGES.map(({ icon: Icon, title, detail, tint }, i) => (
                <div
                  key={title}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-br p-10 transition-all duration-700 ease-out ${tint} ${i === active ? 'translate-y-0 scale-100 opacity-100' : i < active ? '-translate-y-6 scale-95 opacity-0' : 'translate-y-6 scale-95 opacity-0'}`}
                >
                  <span className="mono text-sm font-semibold text-accent-strong">0{i + 1} / 0{ADVANTAGES.length}</span>
                  <span className="grid size-40 place-items-center self-center rounded-full bg-white/70 text-accent-strong shadow-[0_30px_60px_-30px_rgb(29_63_216/0.5)]">
                    <Icon className="size-20" strokeWidth={1.4} aria-hidden />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-bold tracking-tight">{title}</p>
                    <p className="mt-2 max-w-md text-base leading-relaxed text-body">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
