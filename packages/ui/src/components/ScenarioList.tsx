import React from 'react';

import { ScenarioCard, ScenarioCardProps } from './ScenarioCard';

export interface ScenarioListProps {
  scenarios: ScenarioCardProps[];
  title?: string;
  emptyMessage?: string;
  onView?: (scenarioId: string) => void;
  onEdit?: (scenarioId: string) => void;
  onDelete?: (scenarioId: string) => void;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({
  scenarios,
  title,
  emptyMessage = 'シナリオがありません',
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="scenario-list">
    {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}

    {scenarios.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.scenarioId}
            {...scenario}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </div>
);
