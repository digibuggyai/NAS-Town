// Blog posts. Each body is a list of paragraphs; a string starting with "## " is a subheading.
// Starter posts written from general NAS best practice; review and edit before relying on them.

export const posts = [
  {
    slug: 'photographers-moving-off-external-drives',
    title: 'Why photographers are moving off external drives',
    excerpt: 'A drawer of external drives feels safe until one of them stops spinning. Here is what a NAS changes for a growing photo library.',
    category: 'Photography',
    date: '2026-09-28',
    readMins: 4,
    image: '/images/solutions/photographers.webp',
    alt: 'Hands holding a camera at golden hour',
    body: [
      'Most photographers start the same way: shoot, copy the card to an external drive, buy another drive when that one fills up. A few years in, the archive is spread across a drawer of drives with names like "Clients 2023 B", and nobody is quite sure which one holds the only copy of a wedding.',
      '## The problem with a drawer of drives',
      'An external drive is a single point of failure. If it is dropped, dies of old age or gets corrupted, whatever lived only on that drive is gone. There is no second copy unless you made one, no history if you overwrite a file, and finding an old shoot means plugging in drives one by one.',
      'RAW files make this worse over time. Modern high-resolution cameras produce files that are tens of megabytes each, so a single busy season can fill several terabytes.',
      '## What a NAS changes',
      'A NAS keeps the whole library in one place, on several drives working together. With RAID, one drive can fail and your photos are still there; you replace the drive and the NAS rebuilds. Snapshots keep earlier versions of folders, so an accidental delete or overwrite can be rolled back.',
      'Because the NAS sits on your network, every computer in the studio sees the same library, and you can reach it remotely to pull up a gallery for a client.',
      '## A setup that works',
      'Keep your editing catalogue on your computer\'s fast internal drive (Lightroom Classic, for example, cannot keep its catalogue on a network drive) and keep the photos themselves on the NAS. Then follow the 3-2-1 rule: three copies of your work, on two different kinds of storage, with one copy off-site, such as a second NAS or a cloud backup.',
      'A 4-bay NAS with RAID 5 is a common starting point for a working photographer: room to grow, and protection against a single drive failing.',
    ],
  },
  {
    slug: 'ransomware-and-your-nas',
    title: 'Ransomware and your NAS',
    excerpt: 'RAID protects you from a failed drive, not from ransomware. These are the settings that actually keep your files recoverable.',
    category: 'Security',
    date: '2026-09-28',
    readMins: 4,
    image: '/images/features/protect.webp',
    alt: 'The inside of a hard drive',
    body: [
      'Ransomware encrypts your files and demands payment for the key. Because a NAS holds everything in one place, it is exactly the kind of target attackers look for, so it is worth ten minutes to set it up properly.',
      '## RAID is not a backup',
      'RAID keeps your data available when a drive fails. It does nothing against ransomware: if your files are encrypted, RAID faithfully keeps the encrypted copies on every drive. Protection comes from other layers.',
      '## Turn on snapshots',
      'Snapshots are read-only point-in-time copies of your shared folders. Synology and QNAP both support them. If files are encrypted or deleted, you can restore the folder to a snapshot taken before the attack. Schedule them to run automatically and keep enough of them to go back several days.',
      '## Close the obvious doors',
      'Keep the NAS operating system and apps updated. Disable or rename default admin accounts, use strong passwords and turn on two-factor sign-in. Avoid exposing the NAS login page directly to the internet; use the vendor\'s secure relay service or a VPN for remote access instead.',
      '## Keep one copy somewhere else',
      'Finally, back up the NAS itself to a second location, such as another NAS or a cloud backup that keeps its own version history. If the worst happens, an off-site copy the attacker could not reach is what gets you back to work.',
      'If you would like a second pair of eyes on your setup, our team can review it remotely or on-site.',
    ],
  },
  {
    slug: 'renting-vs-buying-storage',
    title: 'Renting vs buying storage for projects',
    excerpt: 'A film shoot, a data migration or an event does not always justify buying a NAS. How to decide which makes sense.',
    category: 'Buying guide',
    date: '2026-09-28',
    readMins: 3,
    image: '/images/features/store.webp',
    alt: 'A 2-bay Synology NAS',
    body: [
      'Not every storage need is permanent. A production might need a lot of fast, shared space for a few weeks; an office moving to new systems might need somewhere safe to park data during the switch. In cases like these, renting a NAS can make more sense than buying one.',
      '## When renting makes sense',
      'Rent when the need has a clear end date: a shoot, an event, a migration, or a trial before you commit to a model. You get full performance and support without a large upfront cost, and nothing sits unused on a shelf afterwards.',
      '## When buying makes sense',
      'Buy when the data is ongoing: a studio archive, company files, family photos, or surveillance footage that has to be kept. Over a longer period, owning the hardware usually costs less than repeated rentals or monthly cloud fees, and the NAS keeps growing with you as you add drives.',
      '## A middle path',
      'If you are unsure, renting first is a low-risk way to find out how much space and speed you really use. When the project ends you can return the unit, extend the rental, or move to a purchase sized to what you learned.',
      'Tell us about your project and timeline and we will suggest the right option.',
    ],
  },
];

export const postBySlug = (slug) => posts.find((p) => p.slug === slug);

export const formatPostDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
