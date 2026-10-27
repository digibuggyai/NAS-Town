// Homepage copy. Headings are the approved ones; body copy is tightened so each
// section says one thing once. Edit words here; layout lives in src/sections/.

export const hero = {
  eyebrow: 'Store · Protect · Share · Grow',
  title: 'Your Data Deserves a *Home*',
  body: [
    'Find, configure and manage the right NAS for the way you work, create and store, from family photos and personal files to business data, backups and surveillance.',
  ],
};

export const problem = {
  eyebrow: 'The problem',
  title: 'Your Data Is Growing',
  body: [
    'Photos, videos, projects and backups end up everywhere. Drives fill up, files scatter across devices, and cloud bills keep climbing.',
    'A NAS gives you one central place to store, protect and access your data.',
  ],
  cta: 'Why NAS?',
};

export const whatIsNas = {
  eyebrow: 'What is NAS?',
  title: 'More Than Storage',
  body: [
    'A NAS (Network Attached Storage) is a storage box on your network: one place for every file, backup and photo, reachable from every device.',
  ],
  // Four compact cards (sections/FeatureRows.jsx): diagram, headline, two lines, link.
  points: [
    {
      key: 'store', title: 'Store', headline: 'Everything in one place',
      body: 'Every photo, video and document on one NAS, not five external drives and three cloud accounts. Running out? Add bigger drives, not another subscription.',
      link: { label: 'See NAS products', to: '/products' },
    },
    {
      key: 'protect', title: 'Protect', headline: 'One drive fails, nothing is lost',
      body: 'RAID keeps your files available when a drive dies. Snapshots roll back mistakes and ransomware, and scheduled backups copy what matters off-site.',
      link: { label: 'How RAID setup works', to: '/services/raid-setup' },
    },
    {
      key: 'share', title: 'Share', headline: 'Share files, stay in control',
      body: 'One set of shared folders for the team, or a client link with a password and an expiry date. No email attachments, no version confusion.',
      link: { label: 'NAS for business', to: '/solutions/business' },
    },
    {
      key: 'access', title: 'Access', headline: 'Your files, wherever you are',
      body: 'Open your files from a phone, laptop or browser, at home, in the office or on the road: a client gallery on a shoot, a document while travelling.',
      link: { label: 'NAS for home', to: '/solutions/home' },
    },
  ],
  cta: 'Learn About NAS',
};

export const solutions = {
  eyebrow: 'NAS solutions',
  title: 'NAS for the Way You Work',
  body: ['The right NAS depends on what you do with your data.'],
  // `setup` is a typical starting configuration: a concrete answer, not a promise.
  cards: [
    { slug: 'photographers', image: '/images/solutions/photographers.webp', alt: 'A photographer with his camera in an old Indian street', title: 'Photographers', body: 'RAW files, client projects and a photo library that keeps growing.', setup: '4-bay · RAID 5 · 2.5GbE', cta: 'Explore Photography NAS' },
    { slug: 'videographers', image: '/images/solutions/videographers.webp', alt: 'A video editor with headphones cutting footage on a desktop', title: 'Videographers', body: 'Large footage, project assets and archives, fast enough to edit from.', setup: '4–8 bay · RAID 5 · 2.5–10GbE', cta: 'Explore Video NAS' },
    { slug: 'creators', image: '/images/solutions/creators.webp', alt: 'A content creator with headphones at his recording desk', title: 'Creators', body: 'Media, working files and backups in one organised system.', setup: '4-bay · RAID 5 · NVMe cache', cta: 'Explore Creator NAS' },
    { slug: 'business', image: '/images/solutions/business.webp', alt: 'An Indian office team in a meeting room', title: 'Business', body: 'Company files with user access, backups and team collaboration.', setup: '4–8 bay · RAID 5/6 · ECC memory', cta: 'Explore Business NAS' },
    { slug: 'home', image: '/images/solutions/home.webp', alt: 'A family at home: father, toddler and mother in a saree', title: 'Home', body: 'A private cloud for family photos, videos, backups and documents.', setup: '2-bay · RAID 1 mirror', cta: 'Explore Home NAS' },
    { slug: 'surveillance', image: '/images/solutions/surveillance.webp', alt: 'A CCTV camera mounted on a plastered wall', title: 'Surveillance', body: 'Continuous recording from many cameras, kept safe and searchable.', setup: '4-bay+ · RAID 5 · 24/7 drives', cta: 'Explore Surveillance NAS' },
  ],
  cta: 'Explore All NAS Solutions',
};

export const featured = {
  eyebrow: 'Featured NAS',
  title: 'Meet Your NAS',
  body: 'Selected systems from leading brands. Prices are for the unit, GST inclusive.',
  cta: 'View All NAS Products',
};

export const why = {
  eyebrow: 'Why NASTOWN',
  title: "We Don't Just Sell NAS",
  body: ['Choosing a NAS is only the first step. We help you pick it, set it up and keep it running.'],
  // `fact` is a concrete, checkable detail for each promise.
  points: [
    { key: 'guidance', title: 'Expert Guidance', body: 'Help choosing a NAS for your storage, workflow and budget.', fact: 'On WhatsApp or at our Experience Zone in Nehru Place' },
    { key: 'install', title: 'Installation & Migration', body: 'Installed, configured, and your existing data moved across properly.', fact: 'Installation · RAID setup · Data migration' },
    { key: 'brands', title: 'Multiple Brands', body: 'Compare platforms and choose the one that fits.', fact: 'Synology · QNAP' },
    { key: 'support', title: 'Long-Term Support', body: 'Upgrades, troubleshooting and maintenance, long after the purchase.', fact: 'Remote from ₹2,000 + tax · On-site from ₹5,000 + tax' },
  ],
  cta: 'Explore Our Services',
};

export const finalCta = {
  eyebrow: 'Ready to get started?',
  title: 'Ready to Build Your Storage?',
  body: ["Tell us what you're storing and how you work. We'll help you find the right NAS."],
};
