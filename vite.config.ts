import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { chatApiPlugin } from './server/vitePlugin';
import { devShotPlugin } from './server/devShot';

export default defineConfig({
  plugins: [react(), chatApiPlugin(), devShotPlugin()],
  server: { port: 5180, host: true },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // three is the heaviest dependency by far and changes rarely
          if (/node_modules[\/](three)[\/]/.test(id)) return 'three';
          // react core only — @react-three/* belongs with the rest of vendor,
          // otherwise the two chunks import each other
          if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react';
          return 'vendor';
        },
      },
    },
  },
});
