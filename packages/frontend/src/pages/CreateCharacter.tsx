import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateCharacterForm, CreateCharacterFormData } from '@cartagraph/ui';

import { getCharacterStore } from '../services/character-store';

const CreateCharacter = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateCharacterFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const characterStore = getCharacterStore();

      const characterId = `char-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await characterStore.saveCharacter({
        characterId,
        name: data.name,
        playerId: data.playerId,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      console.log('Character created:', characterId);

      navigate('/characters');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'キャラクターの作成に失敗しました'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/characters');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <span>←</span>
            <span>キャラクター一覧に戻る</span>
          </button>
        </div>

        <CreateCharacterForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          error={error || undefined}
        />
      </div>
    </div>
  );
};

export default CreateCharacter;
