import { MessageCircle } from 'lucide-react';
import Hero from '../sections/Hero.jsx';
import ScrollStatement from '../sections/ScrollStatement.jsx';
import NasAdvantages from '../sections/NasAdvantages.jsx';
import StatsStrip from '../sections/StatsStrip.jsx';
import Solutions from '../sections/Solutions.jsx';
import FeatureRows from '../sections/FeatureRows.jsx';
import ImageExpand from '../sections/ImageExpand.jsx';
import WhyNas from '../sections/WhyNas.jsx';
import HowItWorks from '../sections/HowItWorks.jsx';
import BuildYourNas from '../sections/BuildYourNas.jsx';
import BrandsBand from '../sections/BrandsBand.jsx';
import TrustedBy from '../sections/TrustedBy.jsx';
import Reviews from '../sections/Reviews.jsx';
import InstaReels from '../sections/InstaReels.jsx';
import HouseOfDigibuggy from '../sections/HouseOfDigibuggy.jsx';
import BlogSection from '../sections/BlogSection.jsx';
import HomeFaq from '../sections/HomeFaq.jsx';
import CtaBanner from '../sections/CtaBanner.jsx';
import Seo from '../components/Seo.jsx';
import CurtainReveal from '../components/CurtainReveal.jsx';
import { waLink } from '../data/site.js';
import { quoteText } from '../config/siteContent.js';

export default function Home() {
  return (
    <>
      <Seo />
      <Hero />
      <ScrollStatement />
      <NasAdvantages />
      <StatsStrip />
      <BuildYourNas />
      <Solutions />
      <FeatureRows />
      <ImageExpand />
      <WhyNas />
      <HowItWorks />
      <BrandsBand />
      <TrustedBy />
      <Reviews />
      <InstaReels />
      <HouseOfDigibuggy />
      <BlogSection />
      <HomeFaq />
      <CurtainReveal>
        <CtaBanner
          title="Tell us what you need, we'll quote it"
          cta={<><MessageCircle className="size-4" /> Get a free quote on WhatsApp</>}
          href={waLink(quoteText)}
        >
          <p>Message us what you're storing and how you work. A person from our team replies with a GST-inclusive quote.</p>
        </CtaBanner>
      </CurtainReveal>
    </>
  );
}
