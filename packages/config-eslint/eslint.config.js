import { defineConfig } from 'eslint/config';
import customConfig from './defaults.js';

export default defineConfig({
  extends: [...customConfig],
  rules: {
    'import/extensions': ['off'],
    'import/no-extraneous-dependencies': ['off'],
    'import/no-unresolved': ['off'],
  },
});
