import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Serve static assets from the root
        fs: {
          allow: ['..']
        },
        // Proxy API requests to Vercel in development
        proxy: {
          '/api': {
            target: 'https://appstatik.com',
            changeOrigin: true,
            secure: true,
          }
        }
      },
      // Allow assets folder to be served alongside public folder
      publicDir: 'public',
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Ensure assets folder is accessible
      assetsInclude: ['**/*.ttf', '**/*.otf', '**/*.woff', '**/*.woff2'],
    };
});
