import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],

  // WebWorker支援
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()]
  },

  // WASM支援の最適化
  optimizeDeps: {
    exclude: ['@cartagraph/core']
  },

  // 開発サーバー設定
  server: {
    port: 5173,
    host: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },

  // ビルド設定
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          storage: ['idb', 'zustand']
        }
      }
    }
  }
});