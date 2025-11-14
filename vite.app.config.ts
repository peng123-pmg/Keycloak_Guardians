import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// 用于Web应用预览的独立配置
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist-app',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index-app.html')
    }
  },
  server: {
    port: 3000,
    open: '/index-app.html'
  }
});
