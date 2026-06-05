import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Prior Admin',
        short_name: 'Prior Admin',
        description: 'Prior Admin Panel',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400 // 24 hours
              }
            }
          }
        ]
      },
      // Don't register service worker in development
      devOptions: {
        enabled: false
      }
    })
  ],

  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    strictPort: true,
    open: false, // Don't auto-open browser
    host: true, // Listen on all addresses
  },

  // Build configuration
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true, // Enable source maps for debugging
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            return 'vendors';
          }
        }
      }
    },
    // Improve chunk size warning threshold
    chunkSizeWarningLimit: 1000
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux'
    ]
  }
})