import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    host: true,

    https: {
      key: fs.existsSync('./certs/key.pem') ? fs.readFileSync('./certs/key.pem') : undefined,
      cert: fs.existsSync('./certs/cert.pem') ? fs.readFileSync('./certs/cert.pem') : undefined,
    },

    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }

      // ✅ REMOVE '/models' PROXY
      // DO NOT ADD ANYTHING HERE
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
