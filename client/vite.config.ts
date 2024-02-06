import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

let http_host = 'http://localhost:3001';
let ws_host = 'ws://localhost:3001';
if (process.env.VITE_USE_PROD) {
  http_host = 'https://prod.rollycubes.com';
  ws_host = 'wss://prod.rollycubes.com';
}
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
    port: 3000,
    proxy: {
      '/metrics': {
        target: http_host,
        changeOrigin: true,
        secure: false,
      },
      '/cookie': {
        target: http_host,
        changeOrigin: true,
        secure: false,
      },
      '/list': {
        target: http_host,
        changeOrigin: true,
        secure: false,
      },
      '/create': {
        target: http_host,
        changeOrigin: true,
        secure: false,
      },
      '/ws/': {
        target: ws_host,
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    },
  },
});
