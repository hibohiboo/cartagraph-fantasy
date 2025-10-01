import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// テスト後のクリーンアップ
afterEach(() => {
  cleanup();
});
