import React, { useState } from 'react';

export interface CreateCharacterFormData {
  name: string;
  playerId: string;
}

export interface CreateCharacterFormProps {
  onSubmit: (data: CreateCharacterFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export const CreateCharacterForm: React.FC<CreateCharacterFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}) => {
  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, playerId });
  };

  const isValid = name.trim() !== '' && playerId.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">キャラクター作成</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            キャラクター名 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 勇者アレックス"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="playerId" className="block text-sm font-medium text-gray-700 mb-1">
            プレイヤーID <span className="text-red-500">*</span>
          </label>
          <input
            id="playerId"
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: player-001"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? '作成中...' : 'キャラクターを作成'}
        </button>
      </div>
    </form>
  );
};
