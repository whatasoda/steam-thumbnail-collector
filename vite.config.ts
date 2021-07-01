import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  base: process.env.NODE_ENV === 'production' ? 'https://whatasoda.github.io/steam-thumbnail-collector/' : '/',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
  },
  server: {
    port: 3000,
  },
});
