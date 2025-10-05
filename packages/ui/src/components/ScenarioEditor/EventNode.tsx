// EventNode - React Flowイベントノードコンポーネント
import { Handle, Position } from '@xyflow/react';
import React, { memo } from 'react';

export interface EventNodeData {
  label: string;
  type: 'trigger' | 'condition' | 'effect';
  description?: string;
}

const EVENT_TYPE_COLORS = {
  trigger: 'border-yellow-500 bg-yellow-50',
  condition: 'border-purple-500 bg-purple-50',
  effect: 'border-orange-500 bg-orange-50',
};

const EVENT_TYPE_LABELS = {
  trigger: 'トリガー',
  condition: '条件',
  effect: '効果',
};

interface EventNodeProps {
  data: EventNodeData;
  selected?: boolean;
}

export const EventNode = memo(({ data, selected }: EventNodeProps) => (
    <div
      className={`
        px-3 py-2 rounded-lg border-2 bg-white shadow-sm min-w-[160px]
        ${selected ? 'ring-2 ring-blue-300' : ''}
        ${EVENT_TYPE_COLORS[data.type]}
      `}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-gray-400" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold">{EVENT_TYPE_LABELS[data.type]}</span>
      </div>

      <h4 className="font-semibold text-sm text-gray-900 mb-1">{data.label}</h4>

      {data.description && <p className="text-xs text-gray-600">{data.description}</p>}

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-gray-400" />
    </div>
  ));

EventNode.displayName = 'EventNode';
