import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      envPrefix: ['VITE_', 'GEMINI_'],
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg', 'images/*.png'],
          manifest: {
            name: 'GeoTasker Web',
            short_name: 'GeoTasker',
            description: 'Gestión de tareas con recordatorios basados en ubicación e IA.',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
              {
                src: 'icon.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
              },
              {
                src: 'icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
              }
            ]
          }
        })
      ],
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react-leaflet')) return 'leaflet-vendor';
                if (id.includes('leaflet')) return 'leaflet-vendor';
                if (id.includes('react')) return 'react-vendor';
                return 'vendor';
              }
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: []
      }
    };
});
