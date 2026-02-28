import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: true,
    watch: {
      usePolling: false,
    },
  },
  optimizeDeps: {
    force: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/extension/popup/setupTests.ts',
    exclude: ['server/**', 'node_modules/**'],
  },
})
