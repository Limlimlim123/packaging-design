import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/utils/vitest.setup.ts'],
    include: ['./src/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'src/test/e2e/**/*'],
    globals: true,
    root: '.',
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    testTimeout: 20000,
    hookTimeout: 20000,
    pool: 'threads',
    threads: {
      singleThread: true
    },
    deps: {
      optimizer: {
        web: {
          include: ['@reduxjs/toolkit', 'fabric']
        }
      }
    },
    maxConcurrency: 1,
    maxThreads: 1,
    minThreads: 1
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})