import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const shouldRemoveTestId = mode === 'production' && process.env.VITE_KEEP_TEST_ID !== 'true'

  return {
    plugins: [
      react({
        babel: {
          plugins: shouldRemoveTestId ? [['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]] : []
        }
      })
    ],
    css: {
      transformer: 'postcss',
    },
    build: {
      cssMinify: 'esbuild',
    }
  }
})
