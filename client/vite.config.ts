import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'stitches.config': path.resolve(__dirname, './src/stitches.config.ts'),
    },
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    tsconfigPaths(),
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
  ],
  server: {
    hmr: {
      clientPort: 443,
    },
    proxy: {
      '/cookie': {
        target: 'http://localhost:3001',
        secure: false,
      },
      '/list': {
        target: 'http://localhost:3001',
        secure: false,
      },
      '/create': {
        target: 'http://localhost:3001',
        secure: false,
      },
      '/ws/': {
        target: 'ws://localhost:3001',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    },
  },
});
