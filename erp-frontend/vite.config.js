import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The backend (erp-backend) does not enable CORS, so in development the dev
// server proxies all /api requests to it — the SPA talks to "/api" same-origin.
// Override the target with VITE_PROXY_TARGET if the backend runs elsewhere.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  // F8: Vitest configuration (Jest-compatible API via Vitest + RTL, per
  // architecture.md's testing stack adapted to Vite).
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false,
  },
});
