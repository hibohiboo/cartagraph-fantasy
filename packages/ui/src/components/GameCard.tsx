// GameCard Component - ゲーム用カードコンポーネント
import React from 'react';
import type { CardType } from '@cartagraph/shared';

export interface GameCardProps {
  /** カード名 */
  name: string;
  /** カードタイプ */
  cardType: CardType;
  /** カード説明 */
  description?: string;
  /** タグリスト */
  tags?: string[];
  /** カード状態 */
  state?: 'normal' | 'selected' | 'disabled' | 'used';
  /** クリックハンドラ */
  onClick?: () => void;
  /** サイズバリアント */
  size?: 'small' | 'medium' | 'large';
}

export const GameCard: React.FC<GameCardProps> = ({
  name,
  cardType,
  description,
  tags = [],
  state = 'normal',
  onClick,
  size = 'medium',
}) => {
  // カードタイプごとの色設定
  const typeColors: Record<CardType, string> = {
    action: 'border-blue-500 bg-blue-50',
    choice: 'border-green-500 bg-green-50',
    possession: 'border-purple-500 bg-purple-50',
    scene_transition: 'border-orange-500 bg-orange-50',
  };

  // 状態ごとのスタイル
  const stateStyles: Record<string, string> = {
    normal: 'opacity-100 cursor-pointer hover:shadow-lg transform hover:-translate-y-1',
    selected: 'opacity-100 shadow-xl ring-4 ring-blue-400 transform -translate-y-1',
    disabled: 'opacity-50 cursor-not-allowed',
    used: 'opacity-60 grayscale',
  };

  // サイズごとのスタイル
  const sizeStyles: Record<string, string> = {
    small: 'w-32 h-40 text-xs',
    medium: 'w-40 h-52 text-sm',
    large: 'w-48 h-64 text-base',
  };

  // カードタイプラベル
  const typeLabels: Record<CardType, string> = {
    action: 'アクション',
    choice: '選択',
    possession: '所持品',
    scene_transition: 'シーン遷移',
  };

  const isInteractive = state !== 'disabled' && state !== 'used';

  const className = [
    'rounded-lg border-2 p-3 transition-all duration-200',
    typeColors[cardType],
    stateStyles[state],
    sizeStyles[size],
    'flex flex-col',
  ].join(' ');

  const handleClick = () => {
    if (isInteractive && onClick) {
      onClick();
    }
  };

  return (
    <div className={className} onClick={handleClick}>
      {/* カードヘッダー */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 flex-1">{name}</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-white/70">
          {typeLabels[cardType]}
        </span>
      </div>

      {/* カード説明 */}
      {description && (
        <p className="text-gray-700 flex-1 mb-2 overflow-y-auto">
          {description}
        </p>
      )}

      {/* タグ表示 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded-full bg-white/80 text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
