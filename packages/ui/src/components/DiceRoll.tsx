// DiceRoll Component - アニメーション付きダイス振りコンポーネント
import React, { useState, useEffect, useMemo } from 'react';

export interface DiceRollProps {
  /** ダイスの数 */
  diceCount: number;
  /** ダイスの面数 */
  diceSides: number;
  /** ロール結果 */
  result: number[];
  /** ロール中かどうか */
  isRolling: boolean;
  /** 修正値 */
  modifier?: number;
  /** 合計値 */
  total?: number;
  /** ロール開始ハンドラ */
  onRoll?: () => void;
  /** サイズバリアント */
  size?: 'small' | 'medium' | 'large';
  /** 有利/不利 */
  advantage?: 'normal' | 'advantage' | 'disadvantage';
}

// サイズスタイル定義
const SIZE_STYLES = {
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
} as const;

// 有利/不利スタイル定義
const ADVANTAGE_COLORS = {
  normal: 'border-gray-300 bg-white',
  advantage: 'border-green-400 bg-green-50',
  disadvantage: 'border-red-400 bg-red-50',
} as const;

const ADVANTAGE_LABELS = {
  normal: '',
  advantage: '有利',
  disadvantage: '不利',
} as const;

// ダイスアニメーションロジックを分離したカスタムフック
function useDiceAnimation(
  isRolling: boolean,
  result: number[],
  diceCount: number,
  diceSides: number
) {
  const [animatedValues, setAnimatedValues] = useState<number[]>(result);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setAnimatedValues(
          Array.from(
            { length: diceCount },
            // eslint-disable-next-line sonarjs/pseudo-random
            () => Math.floor(Math.random() * diceSides) + 1
          )
        );
      }, 100);
      return () => clearInterval(interval);
    }
    setAnimatedValues(result);
    return undefined;
  }, [isRolling, result, diceCount, diceSides]);

  return animatedValues;
}

// スタイル計算ロジックを分離したカスタムフック
function useDiceStyles(
  size: 'small' | 'medium' | 'large',
  advantage: 'normal' | 'advantage' | 'disadvantage'
) {
  const sizeStyle = SIZE_STYLES[size];
  const advantageColor = ADVANTAGE_COLORS[advantage];
  const advantageLabel = ADVANTAGE_LABELS[advantage];

  const advantageBadgeClass = useMemo(() => advantage === 'advantage'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700', [advantage]);

  return { sizeStyle, advantageColor, advantageLabel, advantageBadgeClass };
}

// 合計値計算
function calculateTotal(result: number[], modifier: number, total?: number): number {
  return total ?? result.reduce((a, b) => a + b, 0) + modifier;
}

// 有利/不利バッジコンポーネント
const AdvantageBadge: React.FC<{ label: string; className: string }> = ({ label, className }) => (
  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${className}`}>{label}</div>
);

// ダイス表示コンポーネント
const DiceDisplay: React.FC<{
  values: number[];
  isRolling: boolean;
  diceClass: string;
  containerClass: string;
  colorClass: string;
}> = ({ values, isRolling, diceClass, containerClass, colorClass }) => (
  <div className={`flex ${containerClass}`}>
    {values.map((value, index) => (
      <div
        key={index}
        className={`
          ${diceClass}
          ${colorClass}
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
);

// 合計表示コンポーネント
const TotalDisplay: React.FC<{
  result: number[];
  modifier: number;
  total: number;
  textClass: string;
}> = ({ result, modifier, total, textClass }) => (
  <div className={`flex items-center gap-2 ${textClass}`}>
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
    <span className="text-2xl font-bold text-gray-900">{total}</span>
  </div>
);

// ロールボタンコンポーネント
const RollButton: React.FC<{
  onClick: () => void;
  isRolling: boolean;
  diceCount: number;
  diceSides: number;
}> = ({ onClick, isRolling, diceCount, diceSides }) => (
  <button
    onClick={onClick}
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
);

export function DiceRoll(props: DiceRollProps) {
  const { diceCount, diceSides, result, isRolling, modifier = 0, total, size = 'medium', advantage = 'normal', onRoll } = props;

  const animatedValues = useDiceAnimation(isRolling, result, diceCount, diceSides);
  const styles = useDiceStyles(size, advantage);
  const calculatedTotal = total ?? result.reduce((a, b) => a + b, 0) + modifier;

  return (
    <div className="flex flex-col items-center gap-4">
      {advantage !== 'normal' && <AdvantageBadge label={styles.advantageLabel} className={styles.advantageBadgeClass} />}

      <DiceDisplay
        values={animatedValues}
        isRolling={isRolling}
        diceClass={styles.sizeStyle.dice}
        containerClass={styles.sizeStyle.container}
        colorClass={styles.advantageColor}
      />

      {!isRolling && result.length > 0 && (
        <TotalDisplay result={result} modifier={modifier} total={calculatedTotal} textClass={styles.sizeStyle.text} />
      )}

      {onRoll && <RollButton onClick={onRoll} isRolling={isRolling} diceCount={diceCount} diceSides={diceSides} />}
    </div>
  );
}
