import React, { useState } from 'react';

export interface Player {
  userId: string;
  characterName: string;
  status: 'pending' | 'active' | 'kicked';
  joinedAt: string;
}

export interface PlayerManagementModalProps {
  sessionId: string;
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
  onInvitePlayer?: (email: string) => void;
  onKickPlayer?: (userId: string) => void;
  onChangePlayerStatus?: (userId: string, status: Player['status']) => void;
}

export const PlayerManagementModal: React.FC<PlayerManagementModalProps> = ({
  players,
  isOpen,
  onClose,
  onInvitePlayer,
  onKickPlayer,
  onChangePlayerStatus,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !onInvitePlayer) return;

    setIsInviting(true);
    try {
      await onInvitePlayer(inviteEmail);
      setInviteEmail('');
    } finally {
      setIsInviting(false);
    }
  };

  const handleKick = (userId: string) => {
    if (onKickPlayer) {
      onKickPlayer(userId);
    }
  };

  const handleStatusChange = (userId: string, newStatus: Player['status']) => {
    if (onChangePlayerStatus) {
      onChangePlayerStatus(userId, newStatus);
    }
  };

  const activePlayers = players.filter((p) => p.status === 'active');
  const pendingPlayers = players.filter((p) => p.status === 'pending');
  const kickedPlayers = players.filter((p) => p.status === 'kicked');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">プレイヤー管理</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Invite Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">プレイヤーを招待</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isInviting}
              />
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || isInviting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isInviting ? '招待中...' : '招待'}
              </button>
            </div>
          </div>

          {/* Active Players */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              アクティブなプレイヤー ({activePlayers.length})
            </h3>
            {activePlayers.length === 0 ? (
              <p className="text-sm text-gray-500">アクティブなプレイヤーはいません</p>
            ) : (
              <div className="space-y-2">
                {activePlayers.map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{player.characterName}</p>
                      <p className="text-xs text-gray-500">
                        参加日時: {new Date(player.joinedAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleKick(player.userId)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      キック
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Players */}
          {pendingPlayers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                承認待ち ({pendingPlayers.length})
              </h3>
              <div className="space-y-2">
                {pendingPlayers.map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{player.characterName}</p>
                      <p className="text-xs text-gray-500">
                        申請日時: {new Date(player.joinedAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(player.userId, 'active')}
                        className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      >
                        承認
                      </button>
                      <button
                        onClick={() => handleStatusChange(player.userId, 'kicked')}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        拒否
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kicked Players */}
          {kickedPlayers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                キック済み ({kickedPlayers.length})
              </h3>
              <div className="space-y-2">
                {kickedPlayers.map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-gray-600">{player.characterName}</p>
                      <p className="text-xs text-gray-500">
                        参加日時: {new Date(player.joinedAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStatusChange(player.userId, 'active')}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      復帰
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
