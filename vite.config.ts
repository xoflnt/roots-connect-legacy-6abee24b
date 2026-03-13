import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\/auth/, /^\/auth/],
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: "شجرة عائلة الخنيني - فرع الزلفي",
        short_name: "الخنيني",
        description: "بوابة تراث الخنيني — فرع الزلفي",
        theme_color: "#123026",
        background_color: "#F6F4F0",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        dir: "rtl",
        lang: "ar",
        start_url: "/",
        categories: ["lifestyle", "social"],
        prefer_related_applications: false,
        icons: [
          { src: "/pwa/icon-48x48.png", sizes: "48x48", type: "image/png" },
          { src: "/pwa/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "/pwa/icon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "/pwa/icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "/pwa/icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "/pwa/icon-152x152.png", sizes: "152x152", type: "image/png" },
          { src: "/pwa/icon-180x180.png", sizes: "180x180", type: "image/png" },
          { src: "/pwa/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/pwa/icon-384x384.png", sizes: "384x384", type: "image/png" },
          { src: "/pwa/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
