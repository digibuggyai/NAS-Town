// Fixed ambient light behind the glass: slow drifting orbs plus film grain.
// The glass panels blur and refract this layer, which is what makes them read as "liquid".
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute -left-[10%] -top-[15%] h-[55vmax] w-[55vmax] rounded-full bg-accent/[0.22] blur-[120px] animate-drift" />
      <div className="absolute -right-[15%] top-[25%] h-[50vmax] w-[50vmax] rounded-full bg-accent-2/[0.18] blur-[130px] animate-drift [animation-delay:-9s] [animation-duration:34s]" />
      <div className="absolute bottom-[-25%] left-[20%] h-[45vmax] w-[45vmax] rounded-full bg-accent-3/[0.12] blur-[120px] animate-drift [animation-delay:-18s] [animation-duration:40s]" />
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: grain }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,black_110%)]" />
    </div>
  );
}
