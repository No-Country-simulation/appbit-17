import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA: service worker (autoUpdate) + manifest p/ instalar como app.
    // Ícones PNG gerados de public/favicon.svg via scripts/gen-pwa-icons.mjs.
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-192x192.png", "pwa-512x512.png", "maskable-512x512.png"],
      // devOptions habilitado → o SW/manifest funcionam em `vite dev` p/ testar.
      devOptions: { enabled: true },
      manifest: {
        name: "AppBiT — Decisões baseadas em evidência",
        short_name: "AppBiT",
        description:
          "Painel de dados públicos com IA: pergunte em linguagem natural e receba evidências citáveis por região.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#2f6bff",
        background_color: "#ececf1",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "/maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
