// ScenarioPreview - シナリオテスト用プレビューコンポーネント
import React, { useState } from 'react';

export interface PreviewScene {
  id: string;
  name: string;
  description: string;
  choices: PreviewChoice[];
}

export interface PreviewChoice {
  id: string;
  text: string;
  nextSceneId: string;
  condition?: string;
}

export interface ScenarioPreviewProps {
  scenes: PreviewScene[];
  initialSceneId: string;
  onClose?: () => void;
}

interface SceneDisplayProps {
  scene: PreviewScene;
  onChoiceClick: (nextSceneId: string) => void;
}

function SceneDisplay({ scene, onChoiceClick }: SceneDisplayProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{scene.name}</h2>
      <p className="text-gray-700 whitespace-pre-wrap">{scene.description}</p>

      {scene.choices.length > 0 && (
        <div className="space-y-2 pt-4">
          <h3 className="font-semibold text-gray-800">選択肢:</h3>
          <div className="space-y-2">
            {scene.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoiceClick(choice.nextSceneId)}
                className="w-full text-left p-3 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <p className="text-blue-900">{choice.text}</p>
                {choice.condition && (
                  <p className="text-xs text-blue-600 mt-1">条件: {choice.condition}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface NavigationHistoryProps {
  history: string[];
  onHistoryClick: (index: number) => void;
}

function NavigationHistory({ history, onHistoryClick }: NavigationHistoryProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-3">
      <h3 className="font-semibold text-gray-800 mb-2">履歴:</h3>
      <div className="flex flex-wrap gap-2">
        {history.map((sceneName, index) => (
          <button
            key={index}
            onClick={() => onHistoryClick(index)}
            className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            {index + 1}. {sceneName}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScenarioPreview({ scenes, initialSceneId, onClose }: ScenarioPreviewProps) {
  const [currentSceneId, setCurrentSceneId] = useState(initialSceneId);
  const [history, setHistory] = useState<string[]>([]);

  const currentScene = scenes.find((s) => s.id === currentSceneId);

  if (!currentScene) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4">
        <p className="text-red-700">エラー: シーンが見つかりません (ID: {currentSceneId})</p>
      </div>
    );
  }

  const handleChoiceClick = (nextSceneId: string) => {
    setHistory([...history, currentScene.name]);
    setCurrentSceneId(nextSceneId);
  };

  const handleHistoryClick = (index: number) => {
    const newHistory = history.slice(0, index);
    const targetSceneId = index === 0 ? initialSceneId : scenes.find((s) => s.name === history[index - 1])?.id;

    if (targetSceneId) {
      setHistory(newHistory);
      setCurrentSceneId(targetSceneId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">シナリオプレビュー</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
          >
            閉じる
          </button>
        )}
      </div>

      {history.length > 0 && (
        <NavigationHistory history={history} onHistoryClick={handleHistoryClick} />
      )}

      <SceneDisplay scene={currentScene} onChoiceClick={handleChoiceClick} />
    </div>
  );
}
