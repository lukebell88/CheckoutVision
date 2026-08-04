import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The design assets (theming/, iconography/, fonts/) live at the project root,
// alongside src/. Vite's default root is the project root, so those folders are
// importable via ../ from within src using ?raw, ?url and glob imports.
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project under /CheckoutVision/. Assets and the
  // favicon are emitted with that prefix for the built site; dev stays at root.
  base: command === 'build' ? '/CheckoutVision/' : '/',
  plugins: [react()],
  server: {
    port: 5180,
    open: true,
    // next.co.uk only allows its own origin cross-origin, so in dev we proxy the
    // store-stock endpoint through the dev server (same-origin to the browser).
    // Production (static GitHub Pages) has no server — see src/projects/checkout/
    // stores.ts, which routes through a public CORS proxy there instead.
    proxy: {
      '/next-api': {
        target: 'https://www.next.co.uk',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/next-api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Icons are loaded per folder at runtime (see components/Icon). Without
         * this each SVG would be its own chunk — ~860 requests. Grouping by
         * folder makes "load the NEXT brand's feature icons" exactly one request.
         */
        manualChunks(id) {
          const match = id.match(/iconography\/([^/]+)\/([^/]+)\/[^/]+\.svg/);
          if (match) return `icons-${match[1]}-${match[2]}`;
          return undefined;
        },
      },
    },
  },
}));
