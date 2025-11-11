// @ts-ignore: missing type declarations for 'vitest/config'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',
    globals: true,
    
    // Setup files
    setupFiles: ['./src/tests/setup.ts'],
    
    // Test file patterns
    include: ['src/tests/**/*.test.ts'],
    
    // Timeout settings
    testTimeout: 5000,
    hookTimeout: 5000,
    
    // Don't start UI automatically
    // ui: true,
    
    // Don't watch by default for npm test
    watch: false,
  },
  
  // Use same path aliases as main vite config
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@tests': resolve(__dirname, 'src/tests'),
    },
  },
})