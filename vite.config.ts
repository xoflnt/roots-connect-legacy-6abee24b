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
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,webp,svg,woff2}"],
        additionalManifestEntries: [
          { url: '/offline.html', revision: '1' }
        ],
      },
      manifest: {
        name: "نسبي — منصة شجرة العائلة",
        short_name: "نسبي",
        description: "منصة عربية متخصصة لتوثيق شجرة العائلة",
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
        id: "/?source=pwa",
        screenshots: [
          {
            src: "pwa/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
            label: "نسبي",
          },
        ],
        shortcuts: [
          {
            name: "البحث",
            url: "/?view=navigate&source=shortcut",
            icons: [{ src: "pwa/icon-96x96.png", sizes: "96x96" }],
          },
          {
            name: "الشجرة",
            url: "/?view=map&source=shortcut",
            icons: [{ src: "pwa/icon-96x96.png", sizes: "96x96" }],
          },
        ],
        icons: [
          { src: "/pwa/icon-48x48.png", sizes: "48x48", type: "image/png" },
          { src: "/pwa/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "/pwa/icon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "/pwa/icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "/pwa/icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "/pwa/icon-152x152.png", sizes: "152x152", type: "image/png" },
          { src: "/pwa/icon-180x180.png", sizes: "180x180", type: "image/png" },
          { src: "/pwa/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa/icon-384x384.png", sizes: "384x384", type: "image/png" },
          { src: "/pwa/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/pwa/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/pwa/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
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
