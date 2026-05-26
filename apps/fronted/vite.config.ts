import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import daisyui from 'daisyui';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue(), tailwindcss({ plugins: [daisyui] })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/file': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
