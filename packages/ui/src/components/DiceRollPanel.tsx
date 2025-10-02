import React, { useState } from 'react';

export interface DiceRollResult {
  dice1: number;
  dice2: number;
  total: number;
  modifier: number;
  finalResult: number;
  timestamp: string;
}

export interface DiceRollPanelProps {
  onRoll?: (result: DiceRollResult) => void;
  disabled?: boolean;
}

export const DiceRollPanel: React.FC<DiceRollPanelProps> = ({
  onRoll,
  disabled = false,
}) => {
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null);
  const [modifier, setModifier] = useState<number>(0);

  const handleRoll = () => {
    const dice1 = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * 6) + 1;
    const dice2 = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * 6) + 1;
    const total = dice1 + dice2;
    const finalResult = total + modifier;

    const result: DiceRollResult = {
      dice1,
      dice2,
      total,
      modifier,
      finalResult,
      timestamp: new Date().toISOString(),
    };

    setLastResult(result);
    onRoll?.(result);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">ダイスロール</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="modifier" className="text-sm font-medium text-gray-700">
            修正値:
          </label>
          <input
            id="modifier"
            type="number"
            value={modifier}
            onChange={(e) => setModifier(Number(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={disabled}
          />
        </div>

        <button
          onClick={handleRoll}
          disabled={disabled}
          className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          2D6を振る
        </button>

        {lastResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">ダイス結果:</span>
              <div className="flex gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded font-bold text-gray-900">
                  {lastResult.dice1}
                </span>
                <span className="inline-flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded font-bold text-gray-900">
                  {lastResult.dice2}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>合計:</span>
              <span>{lastResult.total}</span>
            </div>

            {lastResult.modifier !== 0 && (
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>修正値:</span>
                <span>{lastResult.modifier > 0 ? '+' : ''}{lastResult.modifier}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg text-indigo-600 pt-2 mt-2 border-t border-gray-200">
              <span>最終結果:</span>
              <span>{lastResult.finalResult}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
