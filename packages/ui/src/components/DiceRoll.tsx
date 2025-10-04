// DiceRoll Component - アニメーション付きダイス振りコンポーネント
import React, { useState, useEffect } from 'react';

export interface DiceRollProps {
  /** ダイスの数 (デフォルト: 2) */
  diceCount?: number;
  /** ダイスの面数 (デフォルト: 6) */
  diceSides?: number;
  /** 修正値 */
  modifier?: number;
  /** ロール結果 */
  result?: number[];
  /** 合計値 */
  total?: number;
  /** ロール中かどうか */
  isRolling?: boolean;
  /** ロール開始ハンドラ */
  onRoll?: () => void;
  /** サイズバリアント */
  size?: 'small' | 'medium' | 'large';
  /** 有利/不利 */
  advantage?: 'normal' | 'advantage' | 'disadvantage';
}

export const DiceRoll: React.FC<DiceRollProps> = ({
  diceCount = 2,
  diceSides = 6,
  modifier = 0,
  result,
  total,
  isRolling = false,
  onRoll,
  size = 'medium',
  advantage = 'normal',
}) => {
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);

  // アニメーション効果
  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setAnimatedValues(
          Array.from(
            { length: diceCount },
            // eslint-disable-next-line sonarjs/pseudo-random
            () => Math.floor(Math.random() * diceSides) + 1,
          ),
        );
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }
    if (result) {
      setAnimatedValues(result);
    }
    return undefined;
  }, [isRolling, result, diceCount, diceSides]);

  // サイズごとのスタイル
  const sizeStyles = {
    small: {
      dice: 'w-10 h-10 text-lg',
      container: 'gap-2',
      text: 'text-sm',
    },
    medium: {
      dice: 'w-16 h-16 text-2xl',
      container: 'gap-3',
      text: 'text-base',
    },
    large: {
      dice: 'w-20 h-20 text-3xl',
      container: 'gap-4',
      text: 'text-lg',
    },
  };

  const styles = sizeStyles[size];

  // 有利/不利の色
  const advantageColors = {
    normal: 'border-gray-300 bg-white',
    advantage: 'border-green-400 bg-green-50',
    disadvantage: 'border-red-400 bg-red-50',
  };

  const advantageLabels = {
    normal: '',
    advantage: '有利',
    disadvantage: '不利',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 有利/不利表示 */}
      {advantage !== 'normal' && (
        <div
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            advantage === 'advantage'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {advantageLabels[advantage]}
        </div>
      )}

      {/* ダイス表示 */}
      <div className={`flex ${styles.container}`}>
        {animatedValues.map((value, index) => (
          <div
            key={index}
            className={`
              ${styles.dice}
              ${advantageColors[advantage]}
              border-2 rounded-lg
              flex items-center justify-center
              font-bold
              ${isRolling ? 'animate-bounce' : 'transition-all'}
            `}
          >
            {value}
          </div>
        ))}
      </div>

      {/* 修正値と合計 */}
      {!isRolling && result && (
        <div className={`flex items-center gap-2 ${styles.text}`}>
          {modifier !== 0 && (
            <>
              <span className="text-gray-600">({result.join(' + ')})</span>
              <span className="text-gray-600">
                {modifier > 0 ? '+' : ''}
                {modifier}
              </span>
              <span className="text-gray-600">=</span>
            </>
          )}
          <span className="text-2xl font-bold text-gray-900">
            {total !== undefined
              ? total
              : result.reduce((a, b) => a + b, 0) + modifier}
          </span>
        </div>
      )}

      {/* ロールボタン */}
      {onRoll && (
        <button
          onClick={onRoll}
          disabled={isRolling}
          className={`
            px-6 py-2 rounded-lg font-semibold
            ${
              isRolling
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }
            transition-all
          `}
        >
          {isRolling ? 'ロール中...' : `${diceCount}d${diceSides}を振る`}
        </button>
      )}
    </div>
  );
};
