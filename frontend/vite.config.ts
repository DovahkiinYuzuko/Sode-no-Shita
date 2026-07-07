import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: mode === 'production' ? [['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]] : []
      }
    })
  ],
  css: {
    transformer: 'postcss',
  },
  build: {
    cssMinify: 'esbuild',
  }
}))
