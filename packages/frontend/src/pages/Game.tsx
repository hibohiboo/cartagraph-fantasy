import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Game = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [wasmStatus, setWasmStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [wasmModule, setWasmModule] = useState<any>(null);

  useEffect(() => {
    async function loadWasm() {
      try {
        // WASM Coreモジュールをロード
        const coreModule = await import('@cartagraph/core/pkg/cartagraph_core.js');
        await coreModule.default();

        setWasmModule(coreModule);
        setWasmStatus('ready');
        console.log('✅ WASM module loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load WASM module:', error);
        setWasmStatus('error');
      }
    }

    loadWasm();
  }, []);

  const testWasmFunction = () => {
    if (wasmModule) {
      try {
        wasmModule.main();
        console.log('✅ WASM function called successfully');
      } catch (error) {
        console.error('❌ WASM function call failed:', error);
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ゲーム画面 - WASM統合テスト</h1>
      {sessionId && <p>セッションID: {sessionId}</p>}

      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '1.5rem',
        borderRadius: '8px',
        margin: '1rem 0'
      }}>
        <h2>WASM統合ステータス</h2>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: wasmStatus === 'loading' ? '#ffa500' :
                           wasmStatus === 'ready' ? '#4caf50' : '#f44336',
            marginRight: '0.5rem'
          }}></span>
          WASM Core: {wasmStatus === 'loading' ? '読み込み中...' :
                     wasmStatus === 'ready' ? '準備完了' : 'エラー'}
        </div>

        {wasmStatus === 'ready' && (
          <button
            onClick={testWasmFunction}
            style={{
              backgroundColor: '#4a9eff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            WASM関数をテスト
          </button>
        )}
      </div>

      {wasmStatus === 'error' && (
        <div style={{
          backgroundColor: '#4c1e1e',
          padding: '1rem',
          borderRadius: '4px',
          color: '#f44336'
        }}>
          WASMモジュールの読み込みに失敗しました。コンソールでエラーを確認してください。
        </div>
      )}
    </div>
  );
};

export default Game;