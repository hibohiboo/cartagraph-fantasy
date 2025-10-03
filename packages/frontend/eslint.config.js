import customConfig from '@cartagraph/config-eslint/frontend.js';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  { ignores: ['vite.config.ts', '**/dist/**', '**/public/**'] },
  {
    extends: [
      ...customConfig,
      {
        files: [
          '**/tests/**',
          '**/test/**',
          '**/e2e/**/*',
          '**/*.test.tsx',
          '**/*.test.ts',
          'vitest.config.ts',
          'playwright.config.ts',
        ],
        rules: {
          'import/extensions': ['off'],
          'import/no-extraneous-dependencies': ['off'],
          'import/no-unresolved': ['off'],
          'sonarjs/slow-regex': ['off'],
          'lintsonarjs/no-empty-test-file': ['off'],
          'no-restricted-syntax': ['off'],
          'no-await-in-loop': ['off'],
          '@typescript-eslint/no-explicit-any': ['off'],
          'no-plusplus': ['off'],
          'sonarjs/no-nested-functions': ['off'],
        },
      },
      {
        files: ['**/*.tsx', '**/*.ts'],
        rules: {
          'sonarjs/todo-tag': ['off'],
        },
      },
    ],
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
);
