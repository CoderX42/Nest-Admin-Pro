import { defineConfig, loadEnv } from 'vite';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    application: {},
    vite: {
      server: {
        host: '0.0.0.0',
        port: Number(env.VITE_PORT) || 5173,
        proxy: {
          '/api': {
            changeOrigin: true,
            // NestJS 后端已经挂载在 /api 前缀，无需 rewrite
            target: 'http://localhost:3000',
            ws: true,
          },
          '/file': {
            changeOrigin: true,
            target: 'http://localhost:3000',
          },
        },
      },
    },
  };
});