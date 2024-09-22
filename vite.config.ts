import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
// https://vitejs.dev/config/
export default defineConfig({
  base: "/digital-clock-display/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Digital Clock Display",
        short_name: "Digital Clock",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        start_url: "/digital-clock-display/",
        icons: [
          {
            src: "/digital-clock-display/favicon.svg",
            sizes: "192x192",
            type: "image/svg",
          },
          {
            src: "/digital-clock-display/apple-touch-icon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
});
