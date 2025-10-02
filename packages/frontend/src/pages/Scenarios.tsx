import { ScenarioList, ScenarioCardProps } from '@cartagraph/ui';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getScenarioStore } from '../services/scenario-store';

const Scenarios = () => {
  const [scenarios, setScenarios] = useState<ScenarioCardProps[]>([]);

  const loadScenarios = useCallback(async () => {
    const scenarioStore = getScenarioStore();
    const scenarioMetadata = await scenarioStore.getAllScenarios();

    const scenarioCards: ScenarioCardProps[] = scenarioMetadata.map(
      (scenario) => ({
        scenarioId: scenario.scenarioId,
        title: scenario.title,
        description: scenario.description,
        initialSceneName: scenario.initialSceneName,
        createdAt: scenario.createdAt,
        authorId: scenario.authorId,
      }),
    );

    setScenarios(scenarioCards);
  }, []);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const handleView = (scenarioId: string) => {
    window.location.href = `/scenarios/${scenarioId}`;
  };

  const handleDelete = async (scenarioId: string) => {
    if (
      !window.confirm('このシナリオを削除してもよろしいですか?')
    ) {
      return;
    }

    const scenarioStore = getScenarioStore();
    await scenarioStore.deleteScenario(scenarioId);
    await loadScenarios();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">シナリオ一覧</h1>
          <Link
            to="/scenarios/new"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            新規作成
          </Link>
        </header>

        <ScenarioList
          scenarios={scenarios}
          emptyMessage="まだシナリオがありません。新規作成してみましょう！"
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Scenarios;
