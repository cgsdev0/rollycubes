import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
  ],
  server: {
    proxy: {
      "/cookie": {
        target: "http://localhost:3001",
        secure: false,
      },
      "/list": {
        target: "http://localhost:3001",
        secure: false,
      },
      "/create": {
        target: "http://localhost:3001",
        secure: false,
      },
      "/ws/": {
        target: "ws://localhost:3001",
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    },
  },
});
