import React from 'react';

export interface ScenarioCardProps {
  scenarioId: string;
  title: string;
  description: string;
  initialSceneName?: string;
  createdAt: string;
  authorId: string;
  onView?: (scenarioId: string) => void;
  onEdit?: (scenarioId: string) => void;
  onDelete?: (scenarioId: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenarioId,
  title,
  description,
  initialSceneName,
  createdAt,
  authorId,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </div>

      <div className="space-y-2 mb-4">
        {initialSceneName && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">初期シーン:</span>
            <span className="text-sm text-gray-700">{initialSceneName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">作成者ID:</span>
          <span className="text-sm text-gray-700">{authorId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">作成日:</span>
          <span className="text-sm text-gray-700">{formatDate(createdAt)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {onView && (
          <button
            onClick={() => onView(scenarioId)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            詳細
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(scenarioId)}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            編集
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(scenarioId)}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
};
