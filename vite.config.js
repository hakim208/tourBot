import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "TurboBot",
        short_name: "TurboBot",
        description: "Ассистенти AI барои Туризми Тоҷикистон",
        theme_color: "#4F46E5",
        icons: [
          {
            src: "./public/Без названия.jpeg",  
            sizes: "192x192",
            type: "image/jpeg",       
          },
          {
            src: "./public/Без названия.jpeg",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.gemini\.example\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, 
              },
            },
          },
        ],
      },
    }),
  ],
});
