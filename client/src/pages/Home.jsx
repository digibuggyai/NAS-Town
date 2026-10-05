import Hero from '../sections/Hero.jsx';
import FeatureRows from '../sections/FeatureRows.jsx';
import Solutions from '../sections/Solutions.jsx';
import BlogSection from '../sections/BlogSection.jsx';
import BrandsBand from '../sections/BrandsBand.jsx';
import InstaReels from '../sections/InstaReels.jsx';
import Reviews from '../sections/Reviews.jsx';
import HomeFaq from '../sections/HomeFaq.jsx';
import CtaBanner from '../sections/CtaBanner.jsx';
import Seo from '../components/Seo.jsx';

// Structure follows the reference features page: hero photo, alternating feature
// rows, a comparison table, then a blue banner before the footer.
export default function Home() {
  return (
    <>
      <Seo />
      <Hero />
      <FeatureRows />
      <Solutions />
      <BlogSection />
      <BrandsBand />
      <InstaReels />
      <Reviews />
      <HomeFaq />
      <CtaBanner />
    </>
  );
}
