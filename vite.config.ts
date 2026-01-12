
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-icon-512.png'], 
      manifestFilename: 'manifest.json',
      manifest: {
        id: "lumen-education-pwa",
        scope: "/",
        name: "Lumen Education",
        short_name: "Lumen",
        description: "Plataforma de ensino inclusiva e acessível para todos os estudantes. Estude offline, acompanhe seu progresso e realize atividades.",
        lang: "pt-BR",
        dir: "ltr",
        start_url: "/",
        display: "standalone",
        display_override: [
          "window-controls-overlay",
          "standalone",
          "minimal-ui"
        ],
        background_color: "#0f172a",
        theme_color: "#0f172a",
        orientation: "portrait-primary",
        categories: [
          "education",
          "productivity",
          "teaching"
        ],
        iarc_rating_id: "", 
        related_applications: [],
        prefer_related_applications: false,
        launch_handler: {
          client_mode: "auto"
        },
        edge_side_panel: {
            preferred_width: 480
        },
        file_handlers: [
          {
            action: "/dashboard",
            accept: {
              "text/plain": [".txt"]
            }
          }
        ],
        protocol_handlers: [
          {
            protocol: "web+lumen",
            url: "/join_class?code=%s"
          }
        ],
        share_target: {
          action: "/activities",
          method: "GET",
          params: {
            title: "title",
            text: "text",
            url: "url"
          }
        },
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        screenshots: [
          {
            src: "https://placehold.co/1280x720/0f172a/ffffff.png?text=Lumen+Desktop+View",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Painel do Aluno no Desktop"
          },
          {
            src: "https://placehold.co/360x800/0f172a/ffffff.png?text=Lumen+Mobile+View",
            sizes: "360x800",
            type: "image/png",
            form_factor: "narrow",
            label: "Atividades no Celular"
          }
        ],
        shortcuts: [
          {
            name: "Minhas Turmas",
            short_name: "Turmas",
            description: "Acessar suas turmas diretamente",
            url: "/join_class?utm_source=pwa_shortcut",
            icons: [
              {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png"
              }
            ]
          },
          {
            name: "Ver Atividades",
            short_name: "Atividades",
            description: "Ver atividades pendentes",
            url: "/activities?utm_source=pwa_shortcut",
            icons: [
              {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png"
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 6000000, 
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
            /^\/api/, 
            /^\/__,/,
            /\.(png|jpg|jpeg|svg|ico|webp)$/
        ], 
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ request }) => ['image', 'font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/(firebasestorage\.googleapis\.com|lh3\.googleusercontent\.com|cdn\.tailwindcss\.com)\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cloud-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'ui-vendor': ['@headlessui/react', 'recharts'],
          'utils-vendor': ['idb-keyval', 'browser-image-compression', '@google/genai'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
