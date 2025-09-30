import customConfig from '@cartagraph/config-eslint/frontend.js';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  { ignores: ['vite.config.ts', '**/dist/**', '**/public/**'] },
  {
    extends: [
      ...customConfig,
      {
        files: ['eslint.config.js',  'vitest.config.ts'],
        rules: {
          'import/no-extraneous-dependencies': ['off'],
        },
      },
      {
        files: ['**/tests/**','**/*.test.ts'],
        rules: {
          'import/no-extraneous-dependencies': ['off'],
          '@typescript-eslint/no-explicit-any': ['off'],
          'no-await-in-loop': ['off'],
          'no-promise-executor-return': ['off'],
          'no-plusplus': ['off'],
          'no-shadow': ['off'],
          'sonarjs/no-hardcoded-passwords': ['off'],
        },
      },
    ],
  },
);
