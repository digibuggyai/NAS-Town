import Hero from '../sections/Hero.jsx';
import Problem from '../sections/Problem.jsx';
import Capabilities from '../sections/Capabilities.jsx';
import UseCases from '../sections/UseCases.jsx';
import FinderSection from '../sections/FinderSection.jsx';
import ProductShowcase from '../sections/ProductShowcase.jsx';
import Brands from '../sections/Brands.jsx';
import Tools from '../sections/Tools.jsx';
import Rental from '../sections/Rental.jsx';
import Services from '../sections/Services.jsx';
import Knowledge from '../sections/Knowledge.jsx';
import Stories from '../sections/Stories.jsx';
import FinalCta from '../sections/FinalCta.jsx';

export default function Home() {
  return (
    <>
      <title>NASTOWN | Smart Storage for Every Need</title>
      <Hero />
      <Problem />
      <Capabilities />
      <UseCases />
      <FinderSection />
      <ProductShowcase />
      <Brands />
      <Tools />
      <Rental />
      <Services />
      <Knowledge />
      <Stories />
      <FinalCta />
    </>
  );
}
