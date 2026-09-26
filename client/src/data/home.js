// Homepage copy. Headings are the approved ones; body copy is tightened so each
// section says one thing once. Edit words here; layout lives in src/sections/.

export const hero = {
  eyebrow: 'Store · Protect · Share · Grow',
  title: 'Your Data Deserves a *Home.*',
  body: [
    'Find, configure and manage the right NAS for the way you work, create and store, from family photos and personal files to business data, backups and surveillance.',
  ],
};

export const problem = {
  eyebrow: 'The problem',
  title: 'Your Data Is Growing.',
  body: [
    'Photos, videos, projects and backups end up everywhere. Drives fill up, files scatter across devices, and cloud bills keep climbing.',
    'A NAS gives you one central place to store, protect and access your data.',
  ],
  cta: 'Why NAS?',
};

export const whatIsNas = {
  eyebrow: 'What is NAS?',
  title: 'More Than Storage.',
  body: [
    'A NAS (Network Attached Storage) is a dedicated storage device connected to your network, giving you one central place for your files, backups, media and important data.',
  ],
  points: [
    { key: 'store', title: 'Store', body: 'Files, photos, videos and projects in one place.' },
    { key: 'protect', title: 'Protect', body: 'Backups and redundancy, so one failed drive loses nothing.' },
    { key: 'share', title: 'Share', body: 'Folders across devices, users and teams.' },
    { key: 'access', title: 'Access', body: 'From home, the office or anywhere remotely.' },
  ],
  cta: 'Learn About NAS',
};

export const solutions = {
  eyebrow: 'NAS solutions',
  title: 'NAS for the Way You Work.',
  body: ['The right NAS depends on what you do with your data.'],
  // `setup` is a typical starting configuration: a concrete answer, not a promise.
  cards: [
    { slug: 'photographers', image: '/images/solutions/photographers.webp', alt: 'Hands holding a camera at golden hour', title: 'Photographers', body: 'RAW files, client projects and a photo library that keeps growing.', setup: '4-bay · RAID 5 · 2.5GbE', cta: 'Explore Photography NAS' },
    { slug: 'videographers', image: '/images/solutions/videographers.webp', alt: 'Video editor working on a timeline at his desk', title: 'Videographers', body: 'Large footage, project assets and archives, fast enough to edit from.', setup: '4–8 bay · RAID 5 · 2.5–10GbE', cta: 'Explore Video NAS' },
    { slug: 'creators', image: '/images/solutions/creators.webp', alt: 'Camera and microphone set up for recording', title: 'Creators', body: 'Media, working files and backups in one organised system.', setup: '4-bay · RAID 5 · NVMe cache', cta: 'Explore Creator NAS' },
    { slug: 'business', image: '/images/solutions/business.webp', alt: 'A team working together on laptops', title: 'Business', body: 'Company files with user access, backups and team collaboration.', setup: '4–8 bay · RAID 5/6 · ECC memory', cta: 'Explore Business NAS' },
    { slug: 'home', image: '/images/solutions/home.webp', alt: 'A family relaxing together at home', title: 'Home', body: 'A private cloud for family photos, videos, backups and documents.', setup: '2-bay · RAID 1 mirror', cta: 'Explore Home NAS' },
    { slug: 'surveillance', image: '/images/solutions/surveillance.webp', alt: 'Security camera mounted on a wall', title: 'Surveillance', body: 'Continuous recording from many cameras, kept safe and searchable.', setup: '4-bay+ · RAID 5 · 24/7 drives', cta: 'Explore Surveillance NAS' },
  ],
  cta: 'Explore All NAS Solutions',
};

export const featured = {
  eyebrow: 'Featured NAS',
  title: 'Meet Your NAS.',
  body: 'Selected systems from leading brands. Prices are for the unit, GST inclusive.',
  cta: 'View All NAS Products',
};

export const why = {
  eyebrow: 'Why NASTOWN',
  title: "We Don't Just Sell NAS.",
  body: ['Choosing a NAS is only the first step. We help you pick it, set it up and keep it running.'],
  // `fact` is a concrete, checkable detail for each promise.
  points: [
    { key: 'guidance', title: 'Expert Guidance', body: 'Help choosing a NAS for your storage, workflow and budget.', fact: 'On WhatsApp or at our Nehru Place showroom' },
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
