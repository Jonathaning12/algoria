import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El navegador recibe la versión pública del contenido (sin soluciones ni tests ocultos);
// el contenido completo solo lo usa la API.
const publicContent = fileURLToPath(new URL('../../packages/content/src/public.ts', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^@algoria\/content$/, replacement: publicContent }],
  },
  server: {
    // 5173 suele estar ocupado por otros proyectos Vite; fijamos uno propio.
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'jsdom',
  },
} as never);
