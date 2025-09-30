import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';
import customConfig from './defaults.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
});

export default defineConfig({
  files: ['**/*.ts', '**/*.tsx'],
  ignores: ['dist', 'public'],
  extends: [
    ...customConfig,
    ...compat.extends('plugin:react-hooks/recommended')
  ],
  plugins: {
    'react-refresh': reactRefreshPlugin,
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'import/extensions': ['off'],

    'no-alert': 'off',
    'no-console': 'off',
  },
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      ...globals.node,
      ...globals.browser,
      myCustomGlobal: 'readonly',
    },
  },
});
