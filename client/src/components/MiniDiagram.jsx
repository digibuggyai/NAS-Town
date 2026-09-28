import { Cloud, FileText, Folder, Globe, HardDrive, Image, Laptop, Link2, Lock, RotateCcw, ShieldCheck, Smartphone, User } from 'lucide-react';

const LAYOUTS = {
  store: { center: HardDrive, around: [Image, FileText, Folder, Image] },
  protect: { center: ShieldCheck, around: [HardDrive, RotateCcw, HardDrive, Lock] },
  share: { center: Link2, around: [User, Lock, User, User] },
  access: { center: Cloud, around: [Smartphone, Laptop, Globe, Laptop] },
};

// Satellite positions, as % of the card.
const SPOTS = [[18, 22], [82, 22], [18, 78], [82, 78]];

export default function MiniDiagram({ kind }) {
  const { center: Center, around } = LAYOUTS[kind] ?? LAYOUTS.store;
  return (
    <div className="relative aspect-square w-full" aria-hidden>
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {SPOTS.map(([x, y], i) => (
          <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#c7d2fe" strokeWidth="0.8" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        ))}
        <circle cx="50" cy="50" r="33" fill="none" stroke="#e0e7ff" strokeWidth="0.8" strokeDasharray="1.5 2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute top-1/2 left-1/2 grid size-[34%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-accent-soft ring-1 ring-[#c7d2fe]">
        <Center className="size-1/2 text-accent" strokeWidth={1.6} />
      </span>
      {around.map((Icon, i) => (
        <span
          key={i}
          className="absolute grid size-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-white shadow-[0_2px_8px_rgb(15_23_42/0.1)] ring-1 ring-line"
          style={{ left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%` }}
        >
          <Icon className="size-1/2 text-[#5b7cff]" strokeWidth={1.7} />
        </span>
      ))}
    </div>
  );
}
