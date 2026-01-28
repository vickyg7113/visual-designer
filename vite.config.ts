import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './src/demo',
  build: {
    outDir: '../../dist/demo',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from the project root
      allow: ['..'],
    },
  },
  publicDir: false,
});
