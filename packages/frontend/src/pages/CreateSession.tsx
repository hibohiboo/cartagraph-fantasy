import { CreateSessionForm, CreateSessionFormData } from '@cartagraph/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getSessionStore } from '../services/session-store';
import { getSimpleWorkerService } from '../services/simple-worker-service';

const CreateSession = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // セッションを作成
      const result = await workerService.createSession(
        data.scenarioId,
        data.gmUserId,
      );

      console.log('Session created:', result);

      // 結果をパース（JSON形式）
      const sessionData = JSON.parse(result);
      const sessionId = sessionData.session_id || sessionData.sessionId;

      // IndexedDBにセッションメタデータを保存
      await sessionStore.saveSession({
        sessionId,
        scenarioId: data.scenarioId,
        gmUserId: data.gmUserId,
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
      setError(
        err instanceof Error ? err.message : 'セッションの作成に失敗しました',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/sessions');
  };

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
