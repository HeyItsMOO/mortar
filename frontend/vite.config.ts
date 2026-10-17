import { lingui } from '@lingui/vite-plugin'
import react from '@vitejs/plugin-react'
import wails from '@wailsio/runtime/plugins/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
const DEFAULT_PORT = 9245

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: Number(process.env.WAILS_VITE_PORT) || DEFAULT_PORT,
    strictPort: true,
  },
  plugins: [react(), lingui({ macroTransform: true }), wails('./bindings')],
  // A local app reads its bundle from disk: one file loads faster than chunks fetched as pages open, and its size
  // costs nothing. Component names stay, so the render budget (e2e/render-budget.ts) and stacks name them.
  build: {
    chunkSizeWarningLimit: 10_000,
    rolldownOptions: { output: { keepNames: true } },
  },
})
