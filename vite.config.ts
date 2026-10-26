import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public',
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['dotnet.js']
  }
});
