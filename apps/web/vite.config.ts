import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 5173 suele estar ocupado por otros proyectos Vite; fijamos uno propio.
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  test: {
    environment: 'jsdom',
  },
} as never);
