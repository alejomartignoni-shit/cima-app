import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/cima-app/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
