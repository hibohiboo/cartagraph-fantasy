import React from 'react';

export interface SceneDisplayProps {
  sceneName: string;
  description: string;
  objective?: string;
}

export const SceneDisplay: React.FC<SceneDisplayProps> = ({
  sceneName,
  description,
  objective,
}) => (
  <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-lg p-6 shadow-lg">
    <h2 className="text-2xl font-bold mb-3">{sceneName}</h2>
    <p className="text-gray-200 mb-4 leading-relaxed">{description}</p>
    {objective && (
      <div className="mt-4 p-3 bg-white/10 rounded-md border border-white/20">
        <p className="text-sm font-semibold text-yellow-300 mb-1">目標:</p>
        <p className="text-sm text-gray-100">{objective}</p>
      </div>
    )}
  </div>
);
