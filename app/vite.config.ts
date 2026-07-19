import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: set VITE_BASE=/kaya-climate-game/ in CI. Local default is /.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
