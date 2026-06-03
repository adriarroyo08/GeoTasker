import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg', 'images/*.png'],
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            runtimeCaching: [
              {
                // OpenStreetMap and CARTO tile layers — cache with NetworkFirst (30-day expiry, 500 tiles max)
                urlPattern: /^https:\/\/(?:[a-z]\.tile\.openstreetmap\.org|[a-z]\.basemaps\.cartocdn\.com)\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'map-tiles',
                  networkTimeoutSeconds: 5,
                  expiration: {
                    maxEntries: 500,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
          },
          manifest: {
            id: '/',
            start_url: '/',
            scope: '/',
            lang: 'es',
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
                purpose: 'any'
              },
              {
                src: 'icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any'
              },
              {
                src: 'icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable'
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
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
        env: {
          VITE_GEMINI_API_KEY: 'test_key'
        }
      }
    };
});
