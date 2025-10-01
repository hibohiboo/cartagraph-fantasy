import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SessionList, SessionCardProps } from '@cartagraph-fantasy/ui';

const Sessions = () => {
  const [sessions, setSessions] = useState<SessionCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // TODO: IndexedDBからセッション一覧を取得
      // 現在は空の配列を返す
      setSessions([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セッションの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSession = (sessionId: string) => {
    window.location.href = `/game/${sessionId}`;
  };

  const handleManagePlayers = (sessionId: string) => {
    console.log('Manage players:', sessionId);
    // TODO: プレイヤー管理モーダルを開く
  };

  const activeSessions = sessions.filter(
    (s) => s.status === 'InProgress' || s.status === 'WaitingForPlayers'
  );
  const completedSessions = sessions.filter((s) => s.status === 'Completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl text-red-600">エラー: {error}</div>
        <button
          onClick={loadSessions}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">セッション管理</h1>
        <Link
          to="/sessions/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          新しいセッションを作成
        </Link>
      </header>

      <div className="space-y-8">
        <section>
          <SessionList
            title="アクティブなセッション"
            sessions={activeSessions}
            emptyMessage="現在アクティブなセッションはありません"
            onViewSession={handleViewSession}
            onManagePlayers={handleManagePlayers}
          />
        </section>

        <section>
          <SessionList
            title="完了したセッション"
            sessions={completedSessions}
            emptyMessage="完了したセッションはありません"
            onViewSession={handleViewSession}
          />
        </section>
      </div>
    </div>
  );
};

export default Sessions;
