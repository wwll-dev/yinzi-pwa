import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/yinzi-pwa/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      includeAssets: [
        "apple-touch-icon.png",
        "favicon.ico",
        "favicon.svg",
        "manifest.json",
        "icons/icon-180.png",
        "icons/icon-192.png",
        "icons/icon-192-maskable.png",
        "icons/icon-512.png",
        "icons/icon-512-maskable.png",
        "icons/icon-1024.png",
        "icons/favicon-16.png",
        "icons/favicon-32.png",
        "splash/splash-ipad-mini8-portrait.png",
        "splash/splash-ipad-mini8-landscape.png",
        "splash/splash-ipad-mini6-portrait.png",
        "splash/splash-ipad-mini6-landscape.png",
        "splash/splash-1320x2868.png",
        "splash/splash-2868x1320.png",
        "splash/splash-1206x2622.png",
        "splash/splash-2622x1206.png",
        "splash/splash-1290x2796.png",
        "splash/splash-2796x1290.png",
        "splash/splash-1179x2556.png",
        "splash/splash-2556x1179.png",
        "splash/splash-1170x2532.png",
        "splash/splash-2532x1170.png",
        "splash/splash-1284x2778.png",
        "splash/splash-2778x1284.png",
        "splash/splash-750x1334.png",
        "splash/splash-1334x750.png",
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json,ico}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
