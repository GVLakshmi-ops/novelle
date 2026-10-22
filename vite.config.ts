import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: true,
      watch: {
        // Critical: ignore data/ so library saves do not restart the dev server
        ignored: ['**/data/**', '**/node_modules/**', '**/.git/**'],
      },
    },
  };
});
