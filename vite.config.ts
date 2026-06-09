import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'app-switcher',
    },
    rollupOptions: {
      external: [],
    },
  },
  test: {
    environment: 'happy-dom',
  },
})
