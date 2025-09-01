import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ip': {
        target: 'https://api.ipify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ip/, '') + '?format=json'
      }
    }
  }
})
