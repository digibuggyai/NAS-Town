import { Link } from 'react-router';
import { ArrowRight, CalendarClock, Clapperboard, MoveRight, Server } from 'lucide-react';
import NasVisual from '../components/NasVisual.jsx';
import Reveal from '../components/Reveal.jsx';

const uses = [
  { icon: Clapperboard, label: 'Short-term projects' },
  { icon: MoveRight, label: 'Data migrations' },
  { icon: CalendarClock, label: 'Events' },
  { icon: Server, label: 'Temporary storage' },
];

export default function Rental() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
      <Reveal>
        <div className="glass liquid grid items-center gap-10 overflow-hidden rounded-[2.5rem] p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16">
          <div>
            <p className="eyebrow mb-5">Rent a NAS</p>
            <h2 className="text-gradient text-3xl leading-[1.08] font-semibold sm:text-4xl">Need Storage for Now, Not Forever?</h2>
            <p className="mt-6 text-base leading-relaxed text-muted">
              Rent a NAS for short-term projects, data migrations, events and temporary storage requirements without a large upfront investment.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {uses.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-white/80">
                  <Icon className="size-4 text-accent" /> {label}
                </li>
              ))}
            </ul>
            <Link to="/rent" className="btn btn-primary mt-10">Explore NAS Rentals <ArrowRight className="size-4" /></Link>
          </div>
          <div className="relative">
            <div className="absolute inset-10 rounded-full bg-accent-2/20 blur-3xl" />
            <NasVisual bays={2} className="relative mx-auto w-2/3 lg:w-3/4" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
