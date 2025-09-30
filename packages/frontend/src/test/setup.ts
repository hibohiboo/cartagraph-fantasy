import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom';

// テスト後のクリーンアップ
afterEach(() => {
  cleanup();
});