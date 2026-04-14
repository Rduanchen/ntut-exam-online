/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "chrome103",
  },
  server: {
    proxy: {
      "/api": "http://localhost:3003",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    restoreMocks: true,
  },
});
