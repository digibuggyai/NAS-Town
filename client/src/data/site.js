// All site copy and navigation in one place so content edits don't touch components.
import {
  Camera, Clapperboard, Sparkles, Briefcase, Home, Cctv, Building2,
  Wrench, ArrowRightLeft, Stethoscope, ArrowUpCircle, Layers, ShieldCheck, Headset, Truck, LifeBuoy,
  Cloud, HardDriveDownload, Share2, Globe, Tv, Users, Lock,
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
    slug: 'synology', name: 'Synology', filter: 'synology', logo: { src: '/images/brands/synology.svg', size: [131, 34] },
    tagline: 'Intuitive DSM software, rock-solid reliability.',
    h1: 'Synology NAS: Trusted Storage, Expertly Set Up',
    intro: 'Known for its intuitive DSM software and rock-solid reliability, Synology is a go-to choice for users who want powerful storage without a steep learning curve. Browse the range and get it installed and configured by our team.',
  },
  {
    slug: 'qnap', name: 'QNAP', filter: 'qnap', logo: { src: '/images/brands/qnap.svg', size: [138, 24] },
    tagline: 'More power under the hood.',
    h1: 'QNAP NAS: Performance-Driven Storage Solutions',
    intro: 'QNAP systems are built for users who want more power under the hood, from multimedia and virtualization to heavy-duty enterprise workloads. Explore the lineup and let our team handle the setup.',
  },
  {
    slug: 'asustor', name: 'Asustor', filter: 'asustor',
    tagline: 'Fast hardware, easy ADM software.',
    h1: 'Asustor NAS: Capable Storage, Sharp Pricing',
    intro: 'Asustor pairs fast hardware with its easy-to-use ADM operating system, a strong choice for home media, creators and small offices. Compare it with Synology and QNAP, and let our team configure and install it for you.',
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
    upcoming: ['Synology DS925+ review', 'QNAP TS-464-8G review', 'Synology DS225+ review', 'QNAP TS-433-4G review'],
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
    // Posts are managed in Admin → Blog.
  },
  { slug: 'faq', name: 'FAQ', h1: 'Frequently Asked Questions', intro: 'Got questions about NAS storage, rentals, or our services? Find quick answers here, or reach out to our team directly.' },
];

// NASTOWN FAQs, supplied 12 Oct 2026. The first five also appear on the homepage; all of them
// are on /resources/faq with FAQPage structured data (lib/seo.js).
export const faqs = [
  { q: 'How many drive bays do I need in a NAS?', a: 'For most homes, a 2-bay NAS is enough: two mirrored drives (RAID 1) keep a copy of every file if one drive fails. Creators and small businesses usually do better with 4 bays or more, which allow RAID 5 or RAID 6, more usable capacity and room to add drives later. Choose for the storage you expect to need in the next few years, not just today, because running out of bays means buying a new NAS or an expansion unit.' },
  { q: 'How much usable storage do I get after RAID?', a: 'Usable storage is always less than the total capacity of your drives, because RAID sets space aside for protection. For example, four 8 TB drives give 32 TB of raw capacity: RAID 5 leaves about 24 TB, while RAID 6 or RAID 10 leaves about 16 TB. Two drives in RAID 1 give the capacity of one drive. The operating system and file system use a little more. Use the NASTOWN NAS Configurator to see the usable space for any setup before you buy.' },
  { q: 'Do NAS devices come with hard drives?', a: 'Most NAS devices are sold diskless, which means the hard drives are bought separately. This lets you choose the capacity and drive type that suit your budget and workload. Check the product page to see whether drives are included. If you would rather not choose drives yourself, our team can recommend compatible drives, install them and set up RAID for you.' },
  { q: 'Can I use any hard drive in a NAS?', a: "Not every hard drive is suitable. Use NAS-rated drives, such as WD Red Plus or Seagate IronWolf, that are built for always-on use and listed on your NAS maker's compatibility list for your exact model. Avoid SMR (shingled) drives in RAID, as they can slow down badly under heavy writes and make rebuilds much longer. Desktop drives may physically fit but are not designed for 24/7 RAID workloads. SSD cache drives often have their own, stricter compatibility list." },
  { q: 'Can I use non-Synology hard drives in a Synology NAS?', a: "Yes, on most models. Synology NAS released before 2025 are not affected by Synology's newer drive policy and work with third-party NAS drives. On 2025 DiskStation Plus models running DSM 7.3 or later, third-party hard drives that are not on Synology's list can create storage pools, although DSM labels them “Unverified”. Some other 2025 series and M.2 SSD cache have stricter rules, so check Synology's compatibility list for your exact model before buying drives." },
  { q: 'Can I mix hard drives of different sizes in a NAS?', a: 'Yes, but standard RAID treats every drive as the size of the smallest one, so extra space on larger drives is wasted. Synology Hybrid RAID (SHR), available on most Synology models, avoids most of this waste while still protecting against one drive failure (SHR-1) or two (SHR-2). On NAS systems that use standard RAID, matching drive sizes gives you the best use of capacity.' },
  { q: 'Will setting up a NAS erase my existing hard drives?', a: "Usually, yes. When a NAS initialises drives during setup, it formats them and deletes everything on them. Before inserting drives that already hold files, copy the data to another drive or computer and check that the copy opens. Moving drives from an older NAS of the same brand is different: a supported migration can keep your data, but only if you follow the manufacturer's migration steps instead of a fresh setup." },
  { q: 'What happens if a hard drive fails in my NAS?', a: 'With RAID 1, RAID 5 or SHR-1, your NAS keeps running after one drive fails and your files stay accessible, but the storage is “degraded” until you replace the drive. Swap in a healthy drive of equal or larger capacity and start the repair. RAID 6 and SHR-2 can survive two drive failures. If more drives fail than your RAID level allows, data can be lost, so replace failed drives promptly and always keep a separate backup.' },
  { q: 'How do I protect my NAS from ransomware?', a: "Start by keeping your NAS off the open internet: disable port forwarding and UPnP, and use your brand's secure remote access service or a VPN instead. Turn on 2-step verification, disable the default admin account and install firmware updates promptly. Then schedule snapshots, which let you restore files to their state before an attack, and keep a separate off-site or offline backup. On supported models, immutable snapshots add protection against deletion." },
  { q: 'How do I back up my NAS to the cloud?', a: 'Use the backup app built into your NAS, such as Hybrid Backup Sync on QNAP or Hyper Backup on Synology. Choose a cloud destination, select the folders to protect and set a schedule. You can keep multiple versions of files and decide how long each is kept. A cloud copy gives you the off-site backup in the 3-2-1 backup rule. Cloud storage is billed by the provider, and the first upload can take a long time on slower connections.' },
  { q: 'Do I need a UPS for my NAS?', a: "Yes, we strongly recommend one. A sudden power cut can interrupt data being written and put your files at risk. Connect a compatible UPS to the NAS by USB and the NAS will detect an outage and shut down safely after a delay you set. Some NAS can also signal other devices on the same network to shut down. Check your NAS brand's UPS compatibility list before you buy." },
  { q: 'How do I access my NAS remotely?', a: "The easiest way is your NAS brand's remote access service: Synology QuickConnect, QNAP myQNAPcloud Link or ASUSTOR EZ-Connect. These work without router changes and connect through a web browser or mobile app, although relayed connections can be slower. For faster and more secure access, set up a VPN. Avoid opening router ports (port forwarding) to your NAS, because internet-exposed NAS devices are a common target for attacks." },
  { q: 'Why is my NAS transfer speed slow?', a: 'Your slowest link sets the speed. A 1 Gigabit (1GbE) connection tops out at about 125 MB/s in theory and a little less in practice, so check that your computer, switch, cables and NAS all support the speed you expect. Wi-Fi is usually slower than a wired connection. Drive type, RAID level and copying many small files can also reduce speed. Upgrading the NAS to 2.5GbE or 10GbE only helps if your computer and switch support it too.' },
  { q: 'Is a NAS good for video editing?', a: 'Yes. A NAS lets editors store projects in one place and edit directly over the network. Smooth playback depends mostly on network speed: 1GbE can handle lighter HD or proxy workflows, while 4K and multi-camera editing generally need 2.5GbE, 10GbE or faster, plus enough drives for the throughput. SSD cache helps with repeated random access but will not necessarily speed up large video transfers. Test with your own editing software and footage before you commit.' },
  { q: 'Can I upgrade my NAS storage without losing data?', a: 'Yes, in most cases. If you have empty bays, add drives and expand the existing storage pool. If all bays are full, replace drives one at a time with larger ones, letting the NAS rebuild after each swap; the extra capacity appears once enough drives are upgraded. The exact steps depend on your NAS model and RAID type, and each rebuild can take hours or days, so back up your data before you start.' },
  { q: 'Can I move my hard drives to a new NAS?', a: 'Usually, if both NAS units are the same brand. Synology and QNAP let you move drives from an old unit into a new one and keep your data and settings, provided both models support migration. Update the new NAS firmware first, then insert the drives in the same order. Some combinations are not supported, such as QNAP QTS to QuTS hero. Moving drives between different brands is not supported, so copy the data over the network instead.' },
  { q: 'Is a NAS better than cloud storage for a business?', a: 'It depends on how your team works. A NAS gives fast local access, full control of your data and no ongoing per-user storage fees, but it needs an upfront purchase, power, maintenance and a backup plan. Cloud storage offers easy access from anywhere and managed infrastructure for a monthly fee. Many businesses use both: a NAS for daily work and the cloud as an off-site backup.' },
  { q: 'How do I choose a NAS for a small business?', a: 'Start with the number of users, how much data you store and how fast it grows, and the types of files you work with. Choose at least 4 bays so you can use RAID 5 or RAID 6 and expand later. For several users or large files, look for a stronger processor, more memory and 2.5GbE or 10GbE ports. Check support for user permissions and Active Directory, and decide who will manage updates and backups.' },
];

// "NAS for 50TB" landing pages (/nas/50tb). Builds and prices on each page come live from
// the configurator engine; this is the copy that makes each size its own page.
export const capacityPages = [
  {
    tb: 5,
    who: 'Five terabytes suits a household or a solo freelancer: phone and laptop backups for the family, a lifetime of photos, and room for documents and a small media library.',
    tip: 'At this size a 2-bay NAS with two mirrored drives (RAID 1) is usually the simplest, most affordable setup, and it keeps a full copy of everything if one drive fails.',
  },
  {
    tb: 10,
    who: 'Ten terabytes is the sweet spot for an enthusiast photographer, a home media library, or a small office that wants every PC backed up in one place.',
    tip: 'Two large drives mirrored in RAID 1, or three smaller drives in RAID 5, both reach 10TB. A 4-bay unit leaves empty bays so you can grow later without starting over.',
  },
  {
    tb: 20,
    who: 'Twenty terabytes fits working photographers with years of RAW files, YouTubers and editors keeping recent projects online, and offices of 10 to 25 people sharing files.',
    tip: 'A 4-bay NAS in RAID 5 is the usual choice here: good capacity per rupee, protection against one drive failure, and bays to spare on larger drives.',
  },
  {
    tb: 30,
    who: 'Thirty terabytes is where video starts to dominate: wedding and event studios, creators shooting 4K every week, and businesses keeping several years of records and backups.',
    tip: 'Look at 4-bay and 5-bay units with large drives. If the data is irreplaceable, RAID 6 on a 5- or 6-bay NAS survives two drive failures at once.',
  },
  {
    tb: 40,
    who: 'Forty terabytes suits production houses with an active footage archive, multi-camera CCTV keeping weeks of recordings, and growing teams that centralise every department’s files.',
    tip: 'Network speed matters at this size. A unit with 2.5GbE or 10GbE (or an upgrade slot) keeps large transfers and editing off the NAS smooth.',
  },
  {
    tb: 50,
    who: 'Fifty terabytes is a serious archive: a studio’s full client history, 4K and 8K post-production, or a company running file sharing, backups and surveillance on one system.',
    tip: 'A 50TB build usually means four to eight large drives, 16TB to 24TB each. RAID 6 is worth considering, because rebuilding a large array takes long enough for a second drive to fail.',
  },
  {
    tb: 60,
    who: 'Sixty terabytes covers agencies and post houses with multiple editors, schools and offices consolidating years of data, and long-retention surveillance recording.',
    tip: 'Plan for growth: choose a unit that takes an expansion enclosure, and add NVMe cache if several people work off the NAS at once.',
  },
  {
    tb: 100,
    who: 'A hundred terabytes is enterprise territory: media archives, research data, virtualisation storage and backups for an entire organisation.',
    tip: 'At this scale an 8-bay NAS with the largest drives, or more than one unit, is typical. RAID 6, a 10GbE network and an AMC plan protect both the data and the uptime.',
  },
];

// Product shortcuts by size, used by the navbar and footer.
export const productLinks = [
  { label: 'All NAS Products', to: '/products' },
  { label: '2-Bay NAS', to: '/products?bays=2' },
  { label: '4-Bay NAS', to: '/products?bays=4' },
  { label: '6/8-Bay NAS', to: '/products?bays=6-8' },
  { label: 'Rackmount NAS', to: '/products?type=rackmount' },
  { label: 'NAS by Capacity', to: '/nas' },
];

// Main navigation: flat links, no dropdowns. The Configurator is the main conversion tool,
// so the navbar draws it as a highlighted pill. Brands stay out of the nav on purpose: their
// pages remain live and are linked from the footer and product pages.
export const nav = [
  { label: 'Products', to: '/products' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Configurator', to: '/tools/configurator', highlight: true },
  { label: 'Rent a NAS', to: '/rent' },
  { label: 'Services', to: '/services' },
  { label: 'NAS Finder & ROI', to: '/finder' },
  { label: 'Resources', to: '/resources' },
];

// The full site map: footer columns and the /sitemap page.
export const siteMap = [
  ['Products', productLinks.map(({ label, to }) => [label === 'All NAS Products' ? 'NAS Products' : label, to])],
  ['Solutions', solutions.map((s) => [`NAS for ${s.name}`, `/solutions/${s.slug}`])],
  ['Brands', brands.map((b) => [b.name, `/brands/${b.slug}`])],
  ['Services', [['All Services', '/services'], ...services.map((s) => [s.name, `/services/${s.slug}`])]],
  ['Tools', [['NAS Configurator', '/tools/configurator'], ['NAS Finder & ROI', '/finder'], ['Savings calculator', '/finder#roi'], ['Rent a NAS', '/rent']]],
  ['Resources', [['All Resources', '/resources'], ...resources.map((r) => [r.name, `/resources/${r.slug}`])]],
  ['Company', [['About NASTOWN', '/about'], ['Contact Us', '/about#contact'], ['Sitemap', '/sitemap']]],
];

/** A WhatsApp chat with NASTOWN, message pre-filled. */
export const waLink = (text) => `https://wa.me/919560111954?text=${encodeURIComponent(text)}`;

export const brandName = (slug) =>
  ({ synology: 'Synology', qnap: 'QNAP', asustor: 'Asustor' })[slug] ?? slug;

// Instagram reels on the homepage. They play silently on the page; tapping opens the reel
// on Instagram. Put each video in client/public/reels/ (MP4, ideally under 10 MB) with an
// optional poster image (the first frame, JPG). The section stays hidden while this is empty;
// 4 or 8 reels fill the desktop rows neatly.
// Example: { video: '/reels/raid-explained.mp4', poster: '/reels/raid-explained.jpg',
//            url: 'https://www.instagram.com/reel/XXXXXXXXX/', caption: 'RAID explained in 30 seconds' }
export const reels = [];
export const instagramHandle = 'digibuggy';

// Track-record numbers now live in config/siteContent.js (stats), shown on the homepage.

// Parent company. Links taken from digibuggy.com (checked 25 Sep 2026).
export const digibuggy = {
  site: 'https://digibuggy.com/',
  email: 'sales@digibuggy.com',
  whatsapp: '+91 95601 11954',
  whatsappHref: 'https://wa.me/919560111954?text=Hi%20NASTOWN%2C%20I%27d%20like%20help%20choosing%20a%20NAS.',
  // From digibuggy.com/contact-us (checked 26 Sep 2026).
  address: '207, Second Floor, Mansarovar Building, 90 Nehru Place, New Delhi 110019',
  addressShort: 'Nehru Place, New Delhi',
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Digibuggy+Mansarovar+Building+90+Nehru+Place+New+Delhi',
  // Customer reviews live in the database (Admin → Reviews), not here.
  socials: [
    { label: 'WhatsApp', href: 'https://wa.me/919560111954?text=Hi%20NASTOWN%2C%20I%27d%20like%20help%20choosing%20a%20NAS.' },
    { label: 'Instagram', href: 'https://www.instagram.com/digibuggy/' },
    { label: 'YouTube', href: 'https://www.youtube.com/@digibuggy' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/digibuggy' },
    { label: 'Facebook', href: 'https://www.facebook.com/digibuggy' },
    { label: 'X', href: 'https://twitter.com/digibuggy' },
  ],
};
