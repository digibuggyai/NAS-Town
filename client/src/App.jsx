import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Solution from './pages/Solution.jsx';
import Brand from './pages/Brand.jsx';
import Rent from './pages/Rent.jsx';
import Service from './pages/Service.jsx';
import Calculator from './pages/Calculator.jsx';
import Configurator from './pages/Configurator.jsx';
import FinderPage from './pages/FinderPage.jsx';
import Resource from './pages/Resource.jsx';
import About from './pages/About.jsx';
import SitemapPage from './pages/SitemapPage.jsx';
import NotFound from './pages/NotFound.jsx';

// Staff area: loaded only when visited, never linked from the public site.
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="admin/*" element={<Suspense fallback={null}><AdminApp /></Suspense>} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="solutions/:slug" element={<Solution />} />
        <Route path="brands/:slug" element={<Brand />} />
        <Route path="rent" element={<Rent />} />
        <Route path="services/:slug" element={<Service />} />
        <Route path="tools/calculator" element={<Calculator />} />
        <Route path="tools/configurator" element={<Configurator />} />
        <Route path="finder" element={<FinderPage />} />
        <Route path="resources/:slug" element={<Resource />} />
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
