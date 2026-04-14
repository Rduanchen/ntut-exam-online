/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const isCompat = process.env.BUILD_COMPAT === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  ...(isCompat && {
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: {
          chrome: 103 << 16,
        },
      },
    },
  }),
  build: {
    ...(isCompat && {
      target: 'chrome103',
      cssMinify: 'lightningcss',
    }),
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3003',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    restoreMocks: true,
  },
})
