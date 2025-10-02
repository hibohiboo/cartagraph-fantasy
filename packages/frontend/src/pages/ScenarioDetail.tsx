import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getScenarioStore, ScenarioMetadata } from '../services/scenario-store';

const ScenarioDetail = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [scenario, setScenario] = useState<ScenarioMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadScenario = async () => {
      if (!scenarioId) {
        setError('シナリオIDが指定されていません');
        setIsLoading(false);
        return;
      }

      try {
        const scenarioStore = getScenarioStore();
        const scenarioData = await scenarioStore.getScenario(scenarioId);

        if (!scenarioData) {
          setError('シナリオが見つかりませんでした');
        } else {
          setScenario(scenarioData);
        }
      } catch (err) {
        console.error('Failed to load scenario:', err);
        setError('シナリオの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadScenario();
  }, [scenarioId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl text-red-600">
          {error || 'シナリオが見つかりませんでした'}
        </div>
        <Link
          to="/scenarios"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          シナリオ一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <Link
            to="/scenarios"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← シナリオ一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{scenario.title}</h1>
        </header>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">説明</h2>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {scenario.description}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-4">
              シナリオ情報
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">初期シーン</dt>
                <dd className="mt-1 text-base text-gray-900">
                  {scenario.initialSceneName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">作成者ID</dt>
                <dd className="mt-1 text-base text-gray-900">
                  {scenario.authorId}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">作成日時</dt>
                <dd className="mt-1 text-base text-gray-900">
                  {formatDate(scenario.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">更新日時</dt>
                <dd className="mt-1 text-base text-gray-900">
                  {formatDate(scenario.lastUpdated)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-4">
              このシナリオを使用
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              このシナリオを使って新しいセッションを開始できます。
            </p>
            <Link
              to="/sessions/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              このシナリオでセッションを作成
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioDetail;
