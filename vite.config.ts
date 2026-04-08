import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    publicDir: 'public',
    server: {
      port: 3002,
      host: '0.0.0.0',
      strictPort: true,
      cors: {
        origin: '*'
      },
      hmr: {
        protocol: 'ws',
        clientPort: 3002,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    },
    preview: {
      port: 3002,
      host: '0.0.0.0',
      strictPort: true,
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});