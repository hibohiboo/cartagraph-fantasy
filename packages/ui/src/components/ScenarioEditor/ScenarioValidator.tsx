// ScenarioValidator - シナリオ検証結果表示コンポーネント
import React from 'react';

export type ValidationLevel = 'error' | 'warning' | 'info';

export interface ValidationMessage {
  level: ValidationLevel;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ScenarioValidatorProps {
  validationResults: ValidationMessage[];
  onMessageClick?: (nodeId?: string, edgeId?: string) => void;
}

const LEVEL_STYLES = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    icon: '❌',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    icon: 'ℹ️',
  },
} as const;

interface ValidationItemProps {
  validation: ValidationMessage;
  onClick?: (nodeId?: string, edgeId?: string) => void;
}

function ValidationItem({ validation, onClick }: ValidationItemProps) {
  const style = LEVEL_STYLES[validation.level];
  const isClickable = onClick && (validation.nodeId || validation.edgeId);

  return (
    <div
      className={`
        p-3 border rounded-md ${style.bg} ${style.border}
        ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
      onClick={() => isClickable && onClick(validation.nodeId, validation.edgeId)}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{style.icon}</span>
        <p className={`flex-1 ${style.text} text-sm`}>{validation.message}</p>
      </div>
    </div>
  );
}

export function ScenarioValidator({ validationResults, onMessageClick }: ScenarioValidatorProps) {
  const errorCount = validationResults.filter((v) => v.level === 'error').length;
  const warningCount = validationResults.filter((v) => v.level === 'warning').length;

  if (validationResults.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <p className="text-green-700 font-semibold">検証エラーはありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-gray-900">検証結果</h3>
        {errorCount > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            エラー: {errorCount}
          </span>
        )}
        {warningCount > 0 && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
            警告: {warningCount}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {validationResults.map((validation, index) => (
          <ValidationItem
            key={index}
            validation={validation}
            onClick={onMessageClick}
          />
        ))}
      </div>
    </div>
  );
}
