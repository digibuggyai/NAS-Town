import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
// Every other page loads on first visit, so phones download the home page first and fast.
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Solution = lazy(() => import('./pages/Solution.jsx'));
const SolutionsIndex = lazy(() => import('./pages/SolutionsIndex.jsx'));
const ServicesIndex = lazy(() => import('./pages/ServicesIndex.jsx'));
const Brand = lazy(() => import('./pages/Brand.jsx'));
const Rent = lazy(() => import('./pages/Rent.jsx'));
const Service = lazy(() => import('./pages/Service.jsx'));
const Calculator = lazy(() => import('./pages/Calculator.jsx'));
const Configurator = lazy(() => import('./pages/Configurator.jsx'));
const FinderPage = lazy(() => import('./pages/FinderPage.jsx'));
const Resource = lazy(() => import('./pages/Resource.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const SitemapPage = lazy(() => import('./pages/SitemapPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const CapacityIndex = lazy(() => import('./pages/CapacityIndex.jsx'));
const CapacityPage = lazy(() => import('./pages/CapacityPage.jsx'));

// Staff area: loaded only when visited (linked quietly from the footer).
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="admin/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />    
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="nas" element={<CapacityIndex />} />
        <Route path="nas/:size" element={<CapacityPage />} />
        <Route path="solutions" element={<SolutionsIndex />} />
        <Route path="solutions/:slug" element={<Solution />} />
        <Route path="brands/:slug" element={<Brand />} />
        <Route path="rent" element={<Rent />} />
        <Route path="services" element={<ServicesIndex />} />
        <Route path="services/:slug" element={<Service />} />
        <Route path="tools/calculator" element={<Calculator />} />
        <Route path="tools/configurator" element={<Configurator />} />
        <Route path="finder" element={<FinderPage />} />
        <Route path="resources/:slug" element={<Resource />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Navigate to="/about#contact" replace />} />
        <Route path="sitemap" element={<SitemapPage />} />
        <Route path="privacy" element={<NotFound title="Privacy Policy" intro="Our privacy policy is being finalised and will be published here." />} />
        <Route path="terms" element={<NotFound title="Terms of Service" intro="Our terms of service are being finalised and will be published here." />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
