import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Background from './Background.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section has rendered.
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  return (
    <>
      <Background />
      <ScrollManager />
      <Navbar />
      <main className="overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
