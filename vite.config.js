import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(),  VitePWA({
      registerType: 'prompt', 
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'TourBot',
        short_name: 'TourBot',
        description: 'The first chat by school in Tajikistan from Shohrukh',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/public/icons/Без названия.jpeg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/public/icons/Без названия.jpeg',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })],
})
