import { CharacterCard, CharacterCardProps } from '@cartagraph/ui';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';


import { getCharacterStore } from '../services/character-store';

const Characters = () => {
  const [characters, setCharacters] = useState<CharacterCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const characterStore = getCharacterStore();

      const characterMetadata = await characterStore.getAllCharacters();

      const characterProps: CharacterCardProps[] = characterMetadata.map((char) => ({
        characterId: char.characterId,
        name: char.name,
        playerId: char.playerId,
        createdAt: char.createdAt,
      }));

      setCharacters(characterProps);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'キャラクターの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleSelect = (characterId: string) => {
    console.log('Select character:', characterId);
  };

  const handleDelete = async (characterId: string) => {
    if (!window.confirm('このキャラクターを削除しますか？')) return;

    try {
      const characterStore = getCharacterStore();
      await characterStore.deleteCharacter(characterId);
      await loadCharacters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'キャラクターの削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl text-red-600">エラー: {error}</div>
        <button
          onClick={loadCharacters}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">キャラクター管理</h1>
        <Link
          to="/characters/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          新しいキャラクターを作成
        </Link>
      </header>

      {characters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">キャラクターがありません</p>
          <Link
            to="/characters/new"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            最初のキャラクターを作成
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.characterId}
              {...character}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Characters;
