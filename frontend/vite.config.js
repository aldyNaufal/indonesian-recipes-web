import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
const baseUrl =
  process.env.NODE_ENV === "production" ? "/were-cooked-frontend/" : "/";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "apple-touch-icon.png",
        "masked-icon.svg",
      ],
      manifest: {
        name: "We're Cooked",
        short_name: "Cooked",
        description: "Aplikasi pencarian resep dari bahan yang ada",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: baseUrl,
        scope: baseUrl,
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            purpose: "any",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/home-dekstop.png",
            sizes: "1920x1043",
            type: "image/png",
            title: "Home",
            form_factor: "wide",
          },
          {
            src: "/detail-dekstop.png",
            sizes: "1920x1043",
            type: "image/png",
            title: "Detail",
            form_factor: "wide",
          },
          {
            src: "/home-mobile.png",
            sizes: "1080x2280",
            type: "image/png",
            title: "Home",
            form_factor: "narrow",
          },
          {
            src: "/detail-mobile.png",
            sizes: "1080x2280",
            type: "image/png",
            title: "Detail",
            form_factor: "narrow",
          },
        ],
      },
    }),
  ],
  base: baseUrl,
  build: {
    outDir: "docs",
  },
});
