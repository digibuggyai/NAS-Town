/*
 * Hero picture: the official Synology DS925+ photo (background removed) on a soft studio
 * stage, with its five front LEDs lit steady green like a running unit. No motion.
 * LED positions are percentages of the 906 × 670 photo.
 */
const LEDS = ['32.8%', '37.6%', '42.4%', '47.0%', '51.8%'];

export default function NasHero() {
  return (
    <div className="nas-stage relative overflow-hidden rounded-[24px] px-6 pt-10 pb-8 sm:px-12 sm:pt-14 sm:pb-10">
      <div className="relative mx-auto max-w-[34rem]">
        <img
          src="/images/hero/ds925plus.webp"
          srcSet="/images/hero/ds925plus-604.webp 604w, /images/hero/ds925plus.webp 906w"
          sizes="(min-width: 1024px) 34rem, 90vw"
          width="906"
          height="670"
          alt="Synology DS925+ 4-bay NAS with its drive lights on"
          fetchPriority="high"
          className="relative block h-auto w-full select-none"
          draggable="false"
        />
        {LEDS.map((top) => <span key={top} aria-hidden className="nas-led" style={{ left: '47.25%', top }} />)}
      </div>
      {/* Contact shadow on the "floor". */}
      <div aria-hidden className="mx-auto -mt-3 h-6 w-[70%] max-w-[26rem] rounded-[50%] bg-[radial-gradient(closest-side,rgb(15_23_42/0.35),transparent)]" />
    </div>
  );
}
