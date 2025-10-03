import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],

  // WebWorker支援
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()],
  },

  // WASM支援の最適化
  optimizeDeps: {
    exclude: ['@cartagraph/core'],
  },

  // テスト設定
  test: {
    globals: true,
    env: {
      BROWSER_TEST: '1',
    },
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
});
