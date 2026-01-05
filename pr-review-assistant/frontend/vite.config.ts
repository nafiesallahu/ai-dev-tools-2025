import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /api/* to the backend service inside the docker-compose network.
      // Also rewrite the path so:
      // - /api/health -> /health
      // - /api/review -> /review
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    env: {
      // In unit tests we want fetch URLs like "/review" (no proxy involved).
      VITE_API_BASE_URL: '',
    },
  },
})


