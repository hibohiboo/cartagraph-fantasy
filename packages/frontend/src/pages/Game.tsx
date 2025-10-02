import {
  SceneDisplay,
  DiceRollPanel,
  EventLogPanel,
  DiceRollResult,
  EventLogEntry,
} from '@cartagraph/ui';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSimpleWorkerService } from '../services/simple-worker-service';

const Game = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [workerService] = useState(() => getSimpleWorkerService());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );
  const [error, setError] = useState<string>('');
  const [events, setEvents] = useState<EventLogEntry[]>([]);

  // WebWorker初期化とゲームデータ読み込み
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await workerService.initialize();
        if (mounted) {
          setStatus('ready');

          // 初期イベントログを追加
          const systemEvent: EventLogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'system',
            message: `ゲームを開始しました (セッションID: ${sessionId || '未設定'})`,
          };
          setEvents([systemEvent]);
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
      if (workerService.isInitialized()) {
        workerService.cleanup();
      }
    };
  }, [workerService, sessionId]);

  // ダイスロール処理
  const handleDiceRoll = async (result: DiceRollResult) => {
    const modifierSign = result.modifier > 0 ? '+' : '';
    const modifierText = result.modifier !== 0
      ? ` (修正: ${modifierSign}${result.modifier})`
      : '';

    const logEntry: EventLogEntry = {
      id: crypto.randomUUID(),
      timestamp: result.timestamp,
      type: 'dice',
      actor: 'プレイヤー',
      message: `2D6を振った: ${result.dice1} + ${result.dice2} = ${result.total}${modifierText} → 最終結果: ${result.finalResult}`,
    };
    setEvents((prev) => [...prev, logEntry]);
  };

  // ローディング・エラー表示
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">ゲームを読み込み中...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl text-red-600">エラー: {error}</div>
        <Link
          to="/sessions"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          セッション一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ゲームプレイ</h1>
            {sessionId && (
              <p className="text-sm text-gray-600 mt-1">
                セッションID: {sessionId}
              </p>
            )}
          </div>
          <Link
            to="/sessions"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            セッション一覧に戻る
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SceneDisplay
              sceneName="遺跡の入口"
              description="古代の遺跡の入口に到着した。石造りの門は半分崩れているが、奥への道は続いている。"
              objective="遺跡の奥に進み、隠された宝物を見つける"
            />

            <DiceRollPanel onRoll={handleDiceRoll} />
          </div>

          <div className="lg:col-span-1">
            <EventLogPanel events={events} maxHeight="600px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
