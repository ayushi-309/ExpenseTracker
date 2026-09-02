import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://expensetracker-ragq.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
