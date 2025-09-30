import globals from 'globals';
import customConfig from './defaults.js';

export default [
  ...customConfig,
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**', 'drizzle/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // バックエンド固有のルール
      'no-console': 'off', // サーバーログ用
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
