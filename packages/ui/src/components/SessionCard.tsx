import React from 'react';

export interface SessionCardProps {
  /** セッションID */
  sessionId: string;
  /** シナリオID */
  scenarioId: string;
  /** GM ユーザーID */
  gmUserId: string;
  /** セッションステータス */
  status: 'WaitingForPlayers' | 'InProgress' | 'Completed';
  /** プレイヤー数 */
  playerCount: number;
  /** 作成日時 (ISO string) */
  createdAt: string;
  /** クリックハンドラー */
  onViewSession?: (sessionId: string) => void;
  /** プレイヤー管理ハンドラー */
  onManagePlayers?: (sessionId: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  sessionId,
  scenarioId,
  gmUserId,
  status,
  playerCount,
  createdAt,
  onViewSession,
  onManagePlayers,
}) => {
  const statusText = {
    WaitingForPlayers: 'プレイヤー募集中',
    InProgress: '進行中',
    Completed: '完了',
  };

  const statusColors = {
    WaitingForPlayers: 'bg-blue-50 text-blue-700 border-blue-200',
    InProgress: 'bg-green-50 text-green-700 border-green-200',
    Completed: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const cardBorderColors = {
    WaitingForPlayers: 'border-l-blue-500',
    InProgress: 'border-l-green-500',
    Completed: 'border-l-gray-400',
  };

  const formattedDate = new Date(createdAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow
        border-l-4 ${cardBorderColors[status]}
        p-6
      `}
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          セッション {sessionId.slice(0, 8)}
        </h3>
        <span
          className={`
            px-3 py-1 rounded-full text-sm font-medium border
            ${statusColors[status]}
          `}
        >
          {statusText[status]}
        </span>
      </div>

      {/* ボディ */}
      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">シナリオ:</span>{' '}
          <span className="font-mono">{scenarioId.slice(0, 8)}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">GM:</span> {gmUserId}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">プレイヤー数:</span> {playerCount}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">作成日時:</span> {formattedDate}
        </div>
      </div>

      {/* フッター */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {onViewSession && (
          <button
            onClick={() => onViewSession(sessionId)}
            className="
              flex-1 px-4 py-2 bg-gray-700 text-white rounded
              hover:bg-gray-800 transition-colors text-sm font-medium
            "
          >
            セッションを見る
          </button>
        )}
        {onManagePlayers && status !== 'Completed' && (
          <button
            onClick={() => onManagePlayers(sessionId)}
            className="
              flex-1 px-4 py-2 bg-blue-600 text-white rounded
              hover:bg-blue-700 transition-colors text-sm font-medium
            "
          >
            プレイヤー管理
          </button>
        )}
      </div>
    </div>
  );
};
