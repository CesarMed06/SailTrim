import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'SailTrim AI',
        short_name: 'SailTrim',
        description: 'Asistente inteligente de trimado de velas con IA. Recomendaciones náuticas precisas sin conexión.',
        theme_color: '#0ea5e9',
        background_color: '#06141b',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        lang: 'es',
        scope: '.',
        categories: ['navigation', 'sports', 'utilities'],
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        screenshots: [],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
