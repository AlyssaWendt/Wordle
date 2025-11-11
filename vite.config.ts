import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external connections
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@tests': resolve(__dirname, 'src/tests'),
    },
  },

  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@styles/_variables.scss";`,
      },
    },
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Plugin configuration (if you add any later)
  plugins: [],

  // Optimization
  optimizeDeps: {
    include: ['openai'],
  },

  // Preview server (for production builds)
  preview: {
    port: 4173,
    open: true,
  },
})