import Hero from '../sections/Hero.jsx';
import Problem from '../sections/Problem.jsx';
import WhatIsNas from '../sections/WhatIsNas.jsx';
import Solutions from '../sections/Solutions.jsx';
import ProductShowcase from '../sections/ProductShowcase.jsx';
import WhyNastown from '../sections/WhyNastown.jsx';
import HomeFaq from '../sections/HomeFaq.jsx';

export default function Home() {
  return (
    <>
      <title>NAS Storage Solutions | NASTOWN</title>
      <Hero />
      <Problem />
      <WhatIsNas />
      <Solutions />
      <ProductShowcase />
      <WhyNastown />
      <HomeFaq />
    </>
  );
}
