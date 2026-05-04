import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss()],

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      base: process.env.VITE_BASE_PATH || '/fertilizerManagementFrontend',
      proxy: {
        // all /api requests go to backend
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});