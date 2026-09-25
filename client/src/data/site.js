// All site copy and navigation in one place so content edits don't touch components.
import {
  Camera, Clapperboard, Sparkles, Briefcase, Home, Cctv, Building2,
  Wrench, ArrowRightLeft, Stethoscope, ArrowUpCircle, Layers, ShieldCheck, Headset, Truck, LifeBuoy,
  Cloud, HardDriveDownload, Share2, Globe, Tv, Users, Lock,
  HardDrive, Boxes, BadgeCheck, CalendarClock, SlidersHorizontal, BookOpen, Info,
} from 'lucide-react';

export const solutions = [
  {
    slug: 'photographers', name: 'Photographers', icon: Camera, useCase: 'photos',
    blurb: 'Store, organize and protect your photo library.',
    h1: 'Never Lose a Shoot Again: NAS Built for Photographers',
    intro: 'RAW files pile up fast, and external drives fail at the worst possible time. A NAS gives you centralized, RAID-protected storage that backs up automatically and lets you access your full portfolio from anywhere, during a client review or a late-night edit.',
    points: ['RAID-protected RAW archive', 'Automatic backup from every card and laptop', 'Remote client galleries and proofing', 'Lightroom and Capture One catalogue friendly'],
  },
  {
    slug: 'videographers', name: 'Videographers', icon: Clapperboard, useCase: 'videos',
    blurb: 'Centralize large video files and simplify your workflow.',
    h1: 'Storage That Keeps Up With Your Footage',
    intro: '4K and 8K projects chew through storage and demand real throughput. Our recommended NAS configurations support fast read/write speeds for smooth timeline scrubbing, multi-editor collaboration, and safe long-term archiving of finished projects.',
    points: ['2.5GbE / 10GbE for editing directly off the NAS', 'NVMe caching for smooth scrubbing', 'Shared projects for multi-editor teams', 'Cold archive for finished projects'],
  },
  {
    slug: 'creators', name: 'Creators', icon: Sparkles, useCase: 'videos',
    blurb: 'A reliable media hub for your creative projects.',
    h1: 'One Home for All Your Creative Assets',
    intro: 'Juggling footage, design files, client assets, and backups across scattered drives slows you down. A creator-focused NAS centralizes everything, syncs across devices, and keeps your work safe without disrupting your workflow.',
    points: ['One library for footage, design and audio', 'Sync across desktop, laptop and phone', 'Versioned backups of every project', 'Share with collaborators by link'],
  },
  {
    slug: 'business', name: 'Business', icon: Briefcase, useCase: 'business',
    blurb: 'Secure storage and collaboration for teams.',
    h1: 'Keep Your Business Running Without the Storage Headaches',
    intro: 'Shared drives, inconsistent backups, and access-control chaos cost businesses real time and money. A business NAS gives your team one secure, centralized system with permission controls, automated backups, and remote access built in.',
    points: ['Central file server with per-user permissions', 'Automated backups of PCs and servers', 'Secure remote access for your team', 'Snapshots that protect against ransomware'],
  },
  {
    slug: 'home', name: 'Home', icon: Home, useCase: 'home',
    blurb: 'Your personal cloud for the entire family.',
    h1: 'Your Own Private Cloud, Right at Home',
    intro: "Stop paying for cloud subscriptions with shrinking storage. A home NAS backs up every device in the house, streams your media library to any screen, and keeps your family's photos and files private and under your control.",
    points: ['Back up every phone and laptop at home', 'Stream your media library to any screen', 'Family photo library you own', 'No monthly cloud storage bills'],
  },
  {
    slug: 'surveillance', name: 'Surveillance', icon: Cctv, useCase: 'surveillance',
    blurb: 'Centralized security footage management.',
    h1: 'Storage Built for 24/7 Surveillance Recording',
    intro: "Standard drives weren't built to record continuously. Surveillance-grade NAS systems handle constant read/write cycles, support multiple camera streams, and keep weeks of footage safely archived and easy to retrieve when it matters.",
    points: ['Continuous multi-camera recording', 'Surveillance-grade drives', 'Weeks of retained footage', 'Fast search and export of events'],
  },
  {
    slug: 'enterprise', name: 'Enterprise', icon: Building2, useCase: 'business',
    blurb: 'High availability for critical workloads.',
    h1: 'Enterprise Storage That Scales With You',
    intro: "When downtime isn't an option, you need storage built for it. Our enterprise NAS solutions offer high availability, expandable capacity, and dedicated support designed for organizations running critical workloads around the clock.",
    points: ['High-availability clusters', 'Expandable capacity with expansion units', 'Virtualization and iSCSI workloads', 'Dedicated support and AMC'],
  },
];

export const brands = [
  {
    slug: 'synology', name: 'Synology', filter: 'synology',
    tagline: 'Intuitive DSM software, rock-solid reliability.',
    h1: 'Synology NAS: Trusted Storage, Expertly Set Up',
    intro: 'Known for its intuitive DSM software and rock-solid reliability, Synology is a go-to choice for users who want powerful storage without a steep learning curve. Browse the range and get it installed and configured by our team.',
  },
  {
    slug: 'qnap', name: 'QNAP', filter: 'qnap',
    tagline: 'More power under the hood.',
    h1: 'QNAP NAS: Performance-Driven Storage Solutions',
    intro: 'QNAP systems are built for users who want more power under the hood, from multimedia and virtualization to heavy-duty enterprise workloads. Explore the lineup and let our team handle the setup.',
  },
  {
    slug: 'ugreen', name: 'UGREEN', filter: 'ugreen',
    tagline: 'Modern hardware, fast networking.',
    h1: 'UGREEN NASync: Modern NAS Hardware',
    intro: 'UGREEN NASync systems pair modern processors with fast built-in networking. Explore the range and let our team handle the setup.',
  },
  {
    slug: 'other', name: 'Other Brands', filter: 'asustor',
    tagline: 'Asustor and more.',
    h1: 'More Trusted NAS Brands to Choose From',
    intro: "Synology and QNAP aren't your only options. We carry additional trusted NAS brands so you can compare features, pricing, and performance to find the system that fits your exact needs.",
  },
];

export const services = [
  {
    slug: 'installation', name: 'Installation', icon: Wrench,
    h1: 'Professional NAS Installation, Done Right',
    intro: 'Skip the trial-and-error setup. Our technicians install and configure your NAS correctly from day one: network settings, storage pools, and user accounts included.',
    includes: ['Drive installation and health check', 'Storage pool and volume setup', 'Users, groups and shared folders', 'Network, remote access and notifications'],
  },
  {
    slug: 'migration', name: 'Migration', icon: ArrowRightLeft,
    h1: 'Migrate Your Data Without the Risk',
    intro: "Switching systems shouldn't mean risking your files. Our migration service transfers your data safely, preserves folder structures and permissions, and keeps downtime to a minimum.",
    includes: ['Pre-migration audit and plan', 'Folder structure and permissions preserved', 'Verified, checksummed transfers', 'Scheduled cut-over with minimal downtime'],
  },
  {
    slug: 'repair', name: 'Repair & Servicing', icon: Stethoscope,
    h1: "NAS Acting Up? We'll Fix It",
    intro: 'From failed drives to boot issues and degraded RAID arrays, our repair team diagnoses and fixes NAS problems fast, with data safety as the top priority.',
    includes: ['Failed and failing drive replacement', 'Degraded RAID rebuilds', 'Boot and firmware recovery', 'Hardware diagnostics and servicing'],
  },
  {
    slug: 'upgrade', name: 'Upgrade', icon: ArrowUpCircle,
    h1: 'Get More Out of Your Existing NAS',
    intro: 'Before you replace your system, consider upgrading it. We handle storage expansion, RAM upgrades, and performance tuning to extend the life of your current NAS.',
    includes: ['Capacity expansion and drive swaps', 'RAM and NVMe cache upgrades', '2.5GbE / 10GbE network upgrades', 'Performance tuning'],
  },
  {
    slug: 'raid-setup', name: 'RAID Setup', icon: Layers,
    h1: 'RAID Setup: Get the Right Balance of Speed and Safety',
    intro: "Choosing the wrong RAID level can cost you performance or protection. Our team configures the right RAID setup for your workload, whether you're prioritizing redundancy, speed, or storage efficiency.",
    includes: ['Workload assessment', 'RAID / SHR level recommendation', 'Array build and verification', 'Hot-spare and alert configuration'],
  },
  {
    slug: 'amc', name: 'AMC', icon: ShieldCheck,
    h1: 'Keep Your NAS Healthy, Year-Round',
    intro: 'An AMC (Annual Maintenance Contract) plan means your NAS gets regular health checks, proactive maintenance, and priority support, so small issues get caught before they become data emergencies.',
    includes: ['Scheduled health checks', 'Firmware and security updates', 'Backup verification', 'Priority support response'],
  },
  {
    slug: 'remote-support', name: 'Remote Support', icon: Headset, price: 'Starting from ₹2,000 + tax',
    h1: 'Fast NAS Support, No Waiting for a Visit',
    intro: 'Many NAS issues can be resolved remotely, from software glitches to configuration errors. Get connected with our support team and get back up and running quickly.',
    includes: ['Software and configuration fixes', 'Remote access and sharing issues', 'Backup job troubleshooting', 'Guided walkthroughs'],
  },
  {
    slug: 'on-site-support', name: 'On-Site Support', icon: Truck, price: 'Starting from ₹5,000 + tax',
    h1: 'When You Need Hands-On Help',
    intro: 'Some problems need a technician in the room: hardware failures, complex installs, or on-premise network setups. Our on-site support team comes to you.',
    includes: ['Hardware failure diagnosis', 'Complex installs and rack mounting', 'On-premise network setup', 'Hands-on handover and training'],
  },
  {
    slug: 'data-recovery', name: 'Data Recovery', icon: LifeBuoy,
    h1: 'Data Recovery When It Matters Most',
    intro: "Crashed volumes, failed drives or accidental deletion: our team works carefully to recover what matters from your NAS, with a clear assessment before any work begins.",
    includes: ['Failed and crashed volume recovery', 'Accidental deletion recovery', 'Assessment before any work begins', 'Confidential handling of your data'],
  },
];

export const capabilities = [
  { name: 'Private Cloud', icon: Cloud },
  { name: 'Backup', icon: HardDriveDownload },
  { name: 'File Sharing', icon: Share2 },
  { name: 'Remote Access', icon: Globe },
  { name: 'Media Server', icon: Tv },
  { name: 'Team Collaboration', icon: Users },
  { name: 'Surveillance', icon: Cctv },
  { name: 'Data Protection', icon: Lock },
];

export const resources = [
  {
    slug: 'guides', name: 'NAS Guides',
    h1: 'NAS Guides: Everything You Need to Know',
    intro: 'New to NAS or want to get more out of your system? Our guides cover setup, RAID configuration, backup strategy, and everyday NAS management.',
    upcoming: ['What is a NAS, and do you need one?', 'RAID levels explained simply', 'The 3-2-1 backup rule for NAS owners', 'Choosing hard drives for your NAS'],
  },
  {
    slug: 'comparisons', name: 'Comparisons',
    h1: 'Compare NAS Systems Side-by-Side',
    intro: 'Not sure which NAS to pick? Our comparison guides break down specs, performance, and pricing across brands and models to help you decide.',
    upcoming: ['Synology vs QNAP: which is right for you?', 'NAS vs cloud storage: the real costs', '2-bay vs 4-bay: how much room to grow?', 'SHR vs RAID 5'],
  },
  {
    slug: 'reviews', name: 'Reviews',
    h1: 'Honest NAS Reviews, Based on Real Use',
    intro: "We test and review NAS systems the way you'll actually use them, for performance, reliability, and value, so you can buy with confidence.",
    upcoming: ['Synology DS224+ review', 'QNAP TS-464 review', 'UGREEN DXP4800 Plus review', 'Synology DS923+ review'],
  },
  {
    slug: 'how-to', name: 'How-To',
    h1: 'Step-by-Step NAS How-Tos',
    intro: 'From initial setup to advanced configuration, our how-to guides walk you through NAS tasks step by step.',
    upcoming: ['Set up remote access securely', 'Back up your Mac and PC to a NAS', 'Create shared folders with permissions', 'Replace a failed drive safely'],
  },
  {
    slug: 'blog', name: 'Blog',
    h1: 'The NASTOWN Blog',
    intro: 'Storage tips, industry news, and practical insights to help you get more out of your NAS, updated regularly.',
    upcoming: ['Why photographers are moving off external drives', 'Ransomware and your NAS', 'How much storage does 8K really need?', 'Renting vs buying storage for projects'],
  },
  { slug: 'faq', name: 'FAQ', h1: 'Frequently Asked Questions', intro: 'Got questions about NAS storage, rentals, or our services? Find quick answers here, or reach out to our team directly.' },
];

export const faqs = [
  { q: 'What is a NAS?', a: 'A NAS (Network Attached Storage) is a dedicated storage device connected to your network. Every device at home or in the office can store, share and back up files to it, like a private cloud that you own.' },
  { q: 'How is a NAS different from an external hard drive?', a: 'An external drive connects to one computer at a time and has no protection if it fails. A NAS is shared over the network, runs automatic backups, can be reached remotely, and uses RAID so a single drive failure does not lose your data.' },
  { q: 'Is RAID a backup?', a: 'No. RAID protects against drive failure, but not against accidental deletion, ransomware, theft or fire. A proper setup combines RAID with snapshots and an off-site or cloud backup.' },
  { q: 'How much storage do I need?', a: 'It depends on what you store and how fast it grows. Try the NAS Calculator for an estimate, or let the NAS Finder recommend a system.' },
  { q: 'Can I rent a NAS instead of buying one?', a: 'Yes. Rent a NAS for short-term projects, data migrations, events or temporary storage, with support included and no large upfront investment.' },
  { q: 'Do you install and configure the NAS for me?', a: 'Yes. We offer installation, RAID setup, migration, upgrades, repairs and annual maintenance contracts, both remotely and on-site.' },
  { q: 'How much does support cost?', a: 'Remote support starts from ₹2,000 + tax and on-site support starts from ₹5,000 + tax. AMC plans are quoted based on your setup.' },
];

export const nav = [
  { label: 'Products', icon: HardDrive, to: '/products' },
  { label: 'Solutions', icon: Boxes, to: '/solutions/photographers', children: solutions.map((s) => ({ label: `NAS for ${s.name}`, to: `/solutions/${s.slug}` })) },
  { label: 'Brands', icon: BadgeCheck, to: '/brands/synology', children: brands.map((b) => ({ label: b.name, to: `/brands/${b.slug}` })) },
  { label: 'Rent a NAS', icon: CalendarClock, to: '/rent' },
  { label: 'Services', icon: Wrench, to: '/services/installation', children: services.map((s) => ({ label: s.name, to: `/services/${s.slug}` })) },
  {
    label: 'Tools', icon: SlidersHorizontal, to: '/tools/configurator', children: [
      { label: 'NAS ROI Calculator', to: '/tools/calculator' },
      { label: 'NAS Configurator', to: '/tools/configurator' },
      { label: 'NAS Finder', to: '/finder' },
    ],
  },
  { label: 'Resources', icon: BookOpen, to: '/resources/guides', children: resources.map((r) => ({ label: r.name, to: `/resources/${r.slug}` })) },
  { label: 'About', icon: Info, to: '/about' },
];

export const brandName = (slug) =>
  ({ synology: 'Synology', qnap: 'QNAP', ugreen: 'UGREEN', asustor: 'Asustor' })[slug] ?? slug;
