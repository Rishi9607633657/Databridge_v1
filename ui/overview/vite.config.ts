import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Builds into DataBridge's static folder: served at /static/overview/ (and /overview redirects there).
   Two entries: the Overview app (index.html) and the globe embed for the classic Dashboards tab
   (embed/overview-embed.js, loaded with a dynamic import by frontend/dashboards.js).
   `npm run dev` proxies /api to a local DataBridge server so the live parts (host health, dashboards,
   catalog, users) work during development. */
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../../frontend/overview',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1800,
    /* no manual chunks: the lazy GlobeScene import puts three.js / R3F / drei in their own chunk,
       loaded only when the 3D globe is shown (by the app or by the embed) */
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        embed: resolve(__dirname, 'src/embed/globeEmbed.tsx'),
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === 'embed' ? 'embed/overview-embed.js' : 'assets/[name]-[hash].js'),
      },
    },
  },
  server: { port: 5173, proxy: { '/api': process.env.DATABRIDGE_URL || 'http://127.0.0.1:8000' } },
});
