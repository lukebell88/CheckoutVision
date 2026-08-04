import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The design assets (theming/, iconography/, fonts/) live at the project root,
// alongside src/. Vite's default root is the project root, so those folders are
// importable via ../ from within src using ?raw, ?url and glob imports.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    open: true,
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
});
