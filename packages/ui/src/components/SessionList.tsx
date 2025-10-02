import React from 'react';
import { SessionCard, SessionCardProps } from './SessionCard';

export interface SessionListProps {
  /** セッション一覧 */
  sessions: SessionCardProps[];
  /** リストタイトル */
  title?: string;
  /** 空の状態のメッセージ */
  emptyMessage?: string;
  /** セッション表示ハンドラー */
  onViewSession?: (sessionId: string) => void;
  /** プレイヤー管理ハンドラー */
  onManagePlayers?: (sessionId: string) => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  title,
  emptyMessage = 'セッションがありません',
  onViewSession,
  onManagePlayers,
}) => (
  <div className="session-list">
    {title && (
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {title}
      </h2>
    )}

    {sessions.length === 0 ? (
      <div className="text-center py-12 px-4">
        <p className="text-gray-500 italic">{emptyMessage}</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <SessionCard
            key={session.sessionId}
            {...session}
            onViewSession={onViewSession}
            onManagePlayers={onManagePlayers}
          />
        ))}
      </div>
    )}
  </div>
);
