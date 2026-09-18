import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'touch-icon.png'],
      manifest: {
        name: 'Digital Clock Display',
        short_name: 'Digital Clock',
        theme_color: '#0b0d10',
        background_color: '#0b0d10',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/touch-icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: { port: 3000 },
  resolve: { alias: { '~': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
