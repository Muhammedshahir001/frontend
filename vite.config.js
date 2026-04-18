import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-x1u8.onrender.com',
        // target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
  // REMOVED: css: { postcss: { plugins: [] } } 
  // Letting Vite auto-detect postcss.config.js instead.
})