// PlayerStatus Component - プレイヤーステータス表示コンポーネント
import React from 'react';
import type { CharacterStatus } from '@cartagraph/shared';

export interface PlayerStatusProps {
  /** プレイヤー名 */
  name: string;
  /** キャラクターステータス */
  status: CharacterStatus;
  /** タグリスト */
  tags?: string[];
  /** 所持カード数 */
  cardCount?: number;
  /** アバター画像URL */
  avatarUrl?: string;
  /** コンパクト表示 */
  compact?: boolean;
  /** クリックハンドラ */
  onClick?: () => void;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({
  name,
  status,
  tags = [],
  cardCount = 0,
  avatarUrl,
  compact = false,
  onClick,
}) => {
  // ステータスごとの色設定
  const statusColors: Record<CharacterStatus, string> = {
    ready: 'border-green-500 bg-green-50',
    in_action: 'border-blue-500 bg-blue-50',
    waiting_for_input: 'border-yellow-500 bg-yellow-50',
    incapacitated: 'border-red-500 bg-red-50',
  };

  // ステータスラベル
  const statusLabels: Record<CharacterStatus, string> = {
    ready: '準備完了',
    in_action: '行動中',
    waiting_for_input: '入力待ち',
    incapacitated: '行動不能',
  };

  // ステータスアイコン
  const statusIcons: Record<CharacterStatus, string> = {
    ready: '✓',
    in_action: '⚡',
    waiting_for_input: '⏳',
    incapacitated: '✕',
  };

  const isClickable = !!onClick;

  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border-l-4
          ${statusColors[status]}
          ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        `}
        onClick={onClick}
      >
        {/* アバター */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
            {name[0]}
          </div>
        )}

        {/* 名前とステータス */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">
            {name}
          </div>
          <div className="text-xs text-gray-600">{statusLabels[status]}</div>
        </div>

        {/* カード数 */}
        {cardCount > 0 && (
          <div className="text-xs font-semibold px-2 py-1 rounded bg-white/70">
            🎴 {cardCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-lg border-2 p-4
        ${statusColors[status]}
        ${isClickable ? 'cursor-pointer hover:shadow-lg transition-all' : ''}
      `}
      onClick={onClick}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-3">
        {/* アバター */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-bold">
            {name[0]}
          </div>
        )}

        {/* 名前とステータス */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-lg">{statusIcons[status]}</span>
            <span className="text-sm font-semibold">
              {statusLabels[status]}
            </span>
          </div>
        </div>
      </div>

      {/* タグ表示 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full bg-white/80 text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* カード数 */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="font-semibold">所持カード:</span>
        <span className="text-lg">🎴 {cardCount}</span>
      </div>
    </div>
  );
};
