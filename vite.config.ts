import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Latviešu Skolotājs',
        short_name: 'LV Skolotājs',
        description: 'Персональный учитель латышского языка',
        theme_color: '#1a1f2e',
        background_color: '#0f1219',
        display: 'standalone',
        lang: 'ru',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/dict\/lv-ru\.json$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lv-dictionary',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/api\/tts\?/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lv-tts-audio',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/scripts/cache/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
