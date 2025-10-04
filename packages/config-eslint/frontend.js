import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';
import customConfig from './defaults.js';

export default defineConfig({
  files: ['**/*.ts', '**/*.tsx'],
  ignores: ['dist', 'public'],
  extends: [...customConfig, 'react-hooks/recommended'],
  plugins: {
    'react-refresh': reactRefreshPlugin,
    'react-hooks': reactHooks,
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
