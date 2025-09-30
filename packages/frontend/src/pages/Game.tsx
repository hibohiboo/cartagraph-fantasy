import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSimpleWorkerService } from '../services/simple-worker-service';

const Game = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [workerService] = useState(() => getSimpleWorkerService());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [testOutput, setTestOutput] = useState<string>('');

  // WebWorker初期化
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await workerService.initialize();
        if (mounted) {
          setStatus('ready');
        }
      } catch (err) {
        console.error('Worker initialization failed:', err);
        if (mounted) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    }

    init();

    return () => {
      mounted = false;
      // 初期化が完了している場合のみクリーンアップ
      if (workerService.isInitialized()) {
        workerService.cleanup();
      }
    };
  }, [workerService]);

  // WebWorkerテスト実行
  const runTest = async () => {
    try {
      setTestOutput('テスト実行中...\n');

      // 1. セッション作成
      const sessionResult = await workerService.createSession('scenario-001', 'gm-user-001');
      setTestOutput(prev => `${prev  }✅ セッション作成: ${sessionResult}\n`);

      // 2. プレイヤー追加
      const playerResult = await workerService.addPlayer('session-123', 'user-001', 'テストキャラクター');
      setTestOutput(prev => `${prev  }✅ プレイヤー追加: ${playerResult}\n`);

      // 3. ダイス振り
      const diceResult = await workerService.rollDice('session-123', 'player-001', 2, 6);
      setTestOutput(prev => `${prev  }✅ ダイス振り: ${diceResult}\n`);

      setTestOutput(prev => `${prev  }\n🎉 全テスト成功！`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setTestOutput(prev => `${prev  }\n❌ エラー: ${errorMsg}`);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return '#ffa500';
      case 'ready': return '#4caf50';
      case 'error': return '#f44336';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading': return 'WebWorker初期化中...';
      case 'ready': return 'WebWorker準備完了';
      case 'error': return 'エラー';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ゲーム画面 - シンプルWebWorker統合</h1>
      {sessionId && <p>セッションID: {sessionId}</p>}

      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '1.5rem',
        borderRadius: '8px',
        margin: '1rem 0'
      }}>
        <h2>WebWorker統合ステータス</h2>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            marginRight: '0.5rem'
          }}></span>
          ステータス: {getStatusText()}
        </div>

        {status === 'ready' && (
          <button
            onClick={runTest}
            style={{
              backgroundColor: '#4a9eff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            WebWorker + WASMテスト実行
          </button>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#4c1e1e',
          padding: '1rem',
          borderRadius: '4px',
          color: '#f44336',
          marginBottom: '1rem'
        }}>
          エラー: {error}
        </div>
      )}

      {testOutput && (
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '1rem',
          borderRadius: '4px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          fontSize: '0.9rem',
          border: '1px solid #444'
        }}>
          <h3>テスト結果:</h3>
          {testOutput}
        </div>
      )}
    </div>
  );
};

export default Game;