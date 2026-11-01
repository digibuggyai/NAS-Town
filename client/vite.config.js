import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import seo, { resolveSiteUrl } from './scripts/seo-plugin.mjs';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const siteUrl = resolveSiteUrl(env);
  return {
    plugins: [react(), tailwindcss(), seo({ siteUrl, apiUrl: env.VITE_API_URL })],
    define: { 'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl) },
    server: {
      port: 5173,
      proxy: { '/api': 'http://localhost:4000' },
    },
  };
});
