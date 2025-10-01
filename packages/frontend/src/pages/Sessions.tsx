import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSimpleWorkerService } from '../services/simple-worker-service';
import './Sessions.css';

interface Session {
  sessionId: string;
  scenarioId: string;
  gmUserId: string;
  status: 'WaitingForPlayers' | 'InProgress' | 'Completed';
  playerCount: number;
  createdAt: string;
}

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セッションの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'InProgress' || s.status === 'WaitingForPlayers');
  const completedSessions = sessions.filter(s => s.status === 'Completed');

  if (loading) {
    return <div className="sessions-loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="sessions-error">
        <p>エラー: {error}</p>
        <button onClick={loadSessions} className="btn btn-primary">
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="sessions-page">
      <header className="sessions-header">
        <h1>セッション管理</h1>
        <Link to="/sessions/new" className="btn btn-primary">
          新しいセッションを作成
        </Link>
      </header>

      <section className="sessions-section">
        <h2>アクティブなセッション</h2>
        {activeSessions.length === 0 ? (
          <p className="sessions-empty">アクティブなセッションはありません</p>
        ) : (
          <div className="sessions-list">
            {activeSessions.map(session => (
              <SessionCard key={session.sessionId} session={session} />
            ))}
          </div>
        )}
      </section>

      <section className="sessions-section">
        <h2>完了したセッション</h2>
        {completedSessions.length === 0 ? (
          <p className="sessions-empty">完了したセッションはありません</p>
        ) : (
          <div className="sessions-list">
            {completedSessions.map(session => (
              <SessionCard key={session.sessionId} session={session} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

interface SessionCardProps {
  session: Session;
}

const SessionCard = ({ session }: SessionCardProps) => {
  const statusText = {
    WaitingForPlayers: 'プレイヤー募集中',
    InProgress: '進行中',
    Completed: '完了',
  };

  return (
    <div className={`session-card session-card--${session.status.toLowerCase()}`}>
      <div className="session-card__header">
        <h3>セッション ID: {session.sessionId.slice(0, 8)}</h3>
        <span className={`session-card__status status--${session.status.toLowerCase()}`}>
          {statusText[session.status]}
        </span>
      </div>
      <div className="session-card__body">
        <p>シナリオ ID: {session.scenarioId.slice(0, 8)}</p>
        <p>GM: {session.gmUserId}</p>
        <p>プレイヤー数: {session.playerCount}</p>
        <p>作成日時: {new Date(session.createdAt).toLocaleString('ja-JP')}</p>
      </div>
      <div className="session-card__footer">
        <Link to={`/game/${session.sessionId}`} className="btn btn-secondary">
          セッションを見る
        </Link>
      </div>
    </div>
  );
};

export default Sessions;
