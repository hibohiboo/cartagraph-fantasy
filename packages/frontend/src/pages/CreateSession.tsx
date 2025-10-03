import { parseGameSessionDtoFromJson } from '@cartagraph/shared';
import { CreateSessionForm, CreateSessionFormData } from '@cartagraph/ui';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ValiError } from 'valibot';

import { getSessionStore } from '../services/session-store';
import { getSimpleWorkerService } from '../services/simple-worker-service';
import { useAppStore } from '../stores/app-store';

const CreateSession = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const currentUserId = useAppStore((state) => state.currentUserId);

  // Worker初期化
  useEffect(() => {
    const initWorker = async () => {
      try {
        const workerService = getSimpleWorkerService();
        if (!workerService.isInitialized()) {
          await workerService.initialize();
        }
        setWorkerReady(true);
      } catch (err) {
        setError('Workerの初期化に失敗しました');
        console.error('Worker initialization failed:', err);
      }
    };

    initWorker();
  }, []);

  // TODO: 実際のシナリオ一覧を取得
  const mockScenarios = [
    {
      id: 'scenario001',
      name: '遺跡の探索',
      description: '古代の遺跡を探索し、隠された宝物を見つけ出す冒険',
    },
    {
      id: 'scenario002',
      name: '闇の森',
      description: '謎に満ちた森で失われた村を探す',
    },
    {
      id: 'scenario003',
      name: 'ドラゴンの洞窟',
      description: '伝説のドラゴンが眠る洞窟への挑戦',
    },
  ];

  const handleSubmit = async (data: CreateSessionFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const workerService = getSimpleWorkerService();
      const sessionStore = getSessionStore();

      // gmUserIdが指定されていない場合はcurrentUserIdを使用
      const gmUserId = data.gmUserId || currentUserId || 'default-gm';

      // セッションを作成
      const result = await workerService.createSession(
        data.scenarioId,
        gmUserId,
      );

      console.log('Session created:', result);

      // 結果をパース（JSON形式）with runtime validation
      const sessionData = parseGameSessionDtoFromJson(result);
      const sessionId = sessionData.session_id;

      // IndexedDBにセッションメタデータを保存
      await sessionStore.saveSession({
        sessionId,
        scenarioId: data.scenarioId,
        gmUserId,
        status: 'WaitingForPlayers',
        playerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log('Session saved to IndexedDB:', sessionId);

      // BroadcastChannelで他のタブに通知
      const channel = new BroadcastChannel('trpg-session-sync');
      channel.postMessage({ type: 'SESSION_CREATED', sessionId });
      channel.close();

      // セッション一覧ページに戻る
      navigate('/sessions');
    } catch (err) {
      // Runtime validation error handling
      if (err instanceof ValiError) {
        console.error('Session data validation failed:', err.issues);
        setError('セッションデータの検証に失敗しました。データ形式が不正です。');
      } else {
        setError(
          err instanceof Error ? err.message : 'セッションの作成に失敗しました',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/sessions');
  };

  if (!workerReady) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-xl text-gray-600">初期化中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <span>←</span>
            <span>セッション一覧に戻る</span>
          </button>
        </div>

        <CreateSessionForm
          scenarios={mockScenarios}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          error={error || undefined}
        />
      </div>
    </div>
  );
};

export default CreateSession;
