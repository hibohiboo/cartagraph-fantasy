// SceneNode - React Flowシーンノードコンポーネント
import { Handle, Position } from '@xyflow/react';
import React, { memo } from 'react';

export interface SceneNodeData {
  label: string;
  description?: string;
  isInitial?: boolean;
  eventCount?: number;
}

interface SceneNodeProps {
  data: SceneNodeData;
  selected?: boolean;
}

export const SceneNode = memo(({ data, selected }: SceneNodeProps) => (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px]
        ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'}
        ${data.isInitial ? 'bg-green-50' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />

      <div className="flex items-center gap-2 mb-1">
        {data.isInitial && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">開始</span>}
        <h3 className="font-bold text-gray-900">{data.label}</h3>
      </div>

      {data.description && <p className="text-xs text-gray-600 mb-2">{data.description}</p>}

      {data.eventCount !== undefined && data.eventCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>📋</span>
          <span>{data.eventCount} イベント</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  ));

SceneNode.displayName = 'SceneNode';
