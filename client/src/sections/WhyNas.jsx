import { Check, ChevronRight, Gauge, HardDriveDownload, History, Lock, Wallet, X, Minus, ShieldCheck } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';

// NAS against the two things people use instead. Plain, checkable statements only: the
// actual rupee comparison is the visitor's own, on /finder#roi.
const OPTIONS = ['NAS', 'Cloud storage', 'External drives'];
const ROWS = [
  { label: 'Cost over 3–5 years', cells: [['yes', 'Paid once; you own it'], ['no', 'Monthly fee that grows with your data'], ['mid', 'Cheap to buy, but you need a second copy']] },
  { label: 'Speed', cells: [['yes', 'Your network speed: 1, 2.5 or 10GbE'], ['no', 'Limited by your internet upload'], ['mid', 'Fast, on one computer at a time']] },
  { label: 'Privacy & ownership', cells: [['yes', 'On your premises, under your control'], ['mid', "On the provider's servers"], ['yes', 'Yours, but easy to lose']] },
  { label: 'A drive fails', cells: [['yes', 'RAID keeps your files available'], ['yes', 'Handled by the provider'], ['no', 'Everything on that drive is gone']] },
  { label: 'Remote access', cells: [['yes', 'From any phone, laptop or browser'], ['yes', 'From anywhere'], ['no', 'Only where it is plugged in']] },
  { label: 'Monthly fees', cells: [['yes', 'None'], ['no', 'Every month, for as long as you store'], ['yes', 'None']] },
];
const MARK = {
  yes: <Check className="size-4 shrink-0 text-success" aria-label="Good" />,
  mid: <Minus className="size-4 shrink-0 text-warning" aria-label="Partly" />,
  no: <X className="size-4 shrink-0 text-error" aria-label="Weak" />,
};

const BENEFITS = [
  { icon: Wallet, title: 'Pay once, not every month', body: 'No subscription. The hardware and the drives are yours.' },
  { icon: ShieldCheck, title: 'A failed drive is not a disaster', body: 'RAID keeps your files available while the drive is replaced.' },
  { icon: Gauge, title: 'Network speed, not internet speed', body: 'Open and edit large files straight off the NAS over 2.5GbE or 10GbE.' },
  { icon: Lock, title: 'Your data stays yours', body: "On your premises, behind your passwords, not on someone else's server." },
  { icon: HardDriveDownload, title: 'Every device, backed up', body: 'Phones, laptops and PCs back up to one place automatically.' },
  { icon: History, title: 'Roll back after ransomware', body: 'Snapshots restore files to how they were before an attack or a mistake.' },
];

export default function WhyNas() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Why NAS</p>
            <h2 className="h-section">Cheaper than the cloud, safer than a drive</h2>
            <p className="mt-4 text-lg leading-relaxed">How a NAS compares with the two things most people use instead.</p>
          </div>
          <Button variant="secondary" to="/finder#roi">See your savings <ChevronRight className="size-4" /></Button>
        </Reveal>

        {/* Desktop: one compact table */}
        <Reveal className="mt-10 hidden overflow-hidden rounded-2xl border border-line bg-raised md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="w-[19%] px-5 py-4 font-normal text-subtle"><span className="sr-only">Compared on</span></th>
                {OPTIONS.map((o, i) => (
                  <th key={o} scope="col" className={`px-5 py-4 text-base font-semibold ${i === 0 ? 'bg-accent-soft text-accent-strong' : ''}`}>{o}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-3.5 font-medium">{r.label}</th>
                  {r.cells.map(([mark, text], i) => (
                    <td key={i} className={`px-5 py-3.5 ${i === 0 ? 'bg-accent-soft/50' : ''}`}>
                      <span className="flex items-start gap-2">{MARK[mark]}<span className={i === 0 ? 'text-fg' : 'text-muted'}>{text}</span></span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        {/* Phones: one card per option */}
        <div className="mt-8 grid gap-4 md:hidden">
          {OPTIONS.map((o, col) => (
            <Reveal key={o} className={`rounded-2xl border bg-raised p-5 ${col === 0 ? 'border-accent/40' : 'border-line'}`}>
              <h3 className={`text-lg font-semibold ${col === 0 ? 'text-accent-strong' : ''}`}>{o}</h3>
              <dl className="mt-3 grid gap-2.5 text-sm">
                {ROWS.map((r) => (
                  <div key={r.label} className="grid grid-cols-[1rem_1fr] gap-x-2">
                    {MARK[r.cells[col][0]]}
                    <div><dt className="text-xs text-subtle">{r.label}</dt><dd>{r.cells[col][1]}</dd></div>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 3) * 80} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-raised text-accent ring-1 ring-line"><Icon className="size-5" aria-hidden /></span>
              <div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
