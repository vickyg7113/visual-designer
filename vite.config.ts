import { defineConfig } from 'vite';
// import { resolve } from 'path';

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
      // Allow serving files from the project root (for UMD in target simulator)
      allow: ['..', '../..'],
    },
  },
  // Serve cdn/ at root so /visual-designer/v1/visual-designer.umd.cjs is available (target.html, snippet).
  // The UMD file is built by: npm run build:sdk (vite.sdk.config.ts); this config only serves whatever is in cdn/.
  publicDir: '../../cdn',
});
