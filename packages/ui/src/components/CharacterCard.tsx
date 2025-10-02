import React from 'react';

export interface CharacterCardProps {
  characterId: string;
  name: string;
  playerId: string;
  createdAt: string;
  onSelect?: (characterId: string) => void;
  onDelete?: (characterId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  characterId,
  name,
  playerId,
  createdAt,
  onSelect,
  onDelete,
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      <div className="flex gap-2">
        {onSelect && (
          <button
            onClick={() => onSelect(characterId)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label={`${name}を選択`}
          >
            選択
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(characterId)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            aria-label={`${name}を削除`}
          >
            削除
          </button>
        )}
      </div>
    </div>

    <div className="space-y-1 text-sm text-gray-600">
      <p>
        <span className="font-medium">プレイヤーID:</span> {playerId}
      </p>
      <p>
        <span className="font-medium">作成日時:</span>{' '}
        {new Date(createdAt).toLocaleString('ja-JP')}
      </p>
    </div>
  </div>
);
