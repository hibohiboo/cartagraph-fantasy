import init, { main } from './pkg/cartagraph_core.js';

async function testWasmIntegration() {
  try {
    console.log('Testing WASM integration...');

    // Initialize WASM module
    await init();
    console.log('✅ WASM module initialized successfully');

    // Call main function
    main();
    console.log('✅ WASM main function called successfully');

    console.log('🎉 WASM integration test passed!');
    return true;
  } catch (error) {
    console.error('❌ WASM integration test failed:', error);
    return false;
  }
}

// Run test if called directly
if (import.meta.main) {
  const success = await testWasmIntegration();
  process.exit(success ? 0 : 1);
}

export { testWasmIntegration };