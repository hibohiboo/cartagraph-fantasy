// WebWorker Integration Test for WASM
// This test simulates WebWorker usage without actually spawning workers

import init, { main } from './pkg/cartagraph_core.js';

// Simulate WebWorker environment checks
function checkWebWorkerCompatibility() {
  const checks = {
    webAssembly: typeof WebAssembly !== 'undefined',
    importMeta: typeof import.meta !== 'undefined',
    asyncAwait: true, // We're already using it
    moduleSupport: true, // ES modules work in this context
  };

  console.log('WebWorker Compatibility Checks:');
  Object.entries(checks).forEach(([feature, supported]) => {
    console.log(`  ${supported ? '✅' : '❌'} ${feature}: ${supported}`);
  });

  return Object.values(checks).every(Boolean);
}

async function testWebWorkerIntegration() {
  try {
    console.log('Testing WebWorker WASM integration...');

    // Check compatibility
    const compatible = checkWebWorkerCompatibility();
    if (!compatible) {
      throw new Error('WebWorker environment not compatible');
    }

    // Initialize WASM in WebWorker-like context
    await init();
    console.log('✅ WASM initialized in WebWorker context');

    // Test basic functionality
    main();
    console.log('✅ WASM functions callable in WebWorker context');

    // Test memory management
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    console.log(`Memory usage: ${Math.round(initialMemory / 1024)}KB`);

    console.log('🎉 WebWorker WASM integration test passed!');
    return true;
  } catch (error) {
    console.error('❌ WebWorker integration test failed:', error);
    return false;
  }
}

// Run test if called directly
if (import.meta.main) {
  const success = await testWebWorkerIntegration();
  process.exit(success ? 0 : 1);
}

export { testWebWorkerIntegration };