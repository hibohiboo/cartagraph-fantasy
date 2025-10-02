import { CreateScenarioForm, CreateScenarioFormData } from '@cartagraph/ui';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getScenarioStore } from '../services/scenario-store';

const CreateScenario = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (data: CreateScenarioFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const scenarioStore = getScenarioStore();

      const scenarioId = `scenario-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      const now = new Date().toISOString();

      await scenarioStore.saveScenario({
        scenarioId,
        title: data.title,
        description: data.description,
        initialSceneName: data.initialSceneName,
        authorId: data.authorId,
        createdAt: now,
        lastUpdated: now,
      });

      navigate('/scenarios');
    } catch (err) {
      console.error('Failed to create scenario:', err);
      setError('シナリオの作成に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/scenarios');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <Link
            to="/scenarios"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← シナリオ一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            シナリオ新規作成
          </h1>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <CreateScenarioForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateScenario;
