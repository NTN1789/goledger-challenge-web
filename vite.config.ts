import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/goledger-api': {
        target: 'http://ec2-50-19-36-138.compute-1.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/goledger-api/, ''),
      },
    },
  },
})
