import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/sdk/index.ts'),
      name: 'VisualDesigner',
      fileName: 'visual-designer',
      formats: ['es', 'umd'],
    },
    outDir: 'dist/sdk',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        globals: {
          // No external dependencies for now
        },
      },
    },
  },
});
