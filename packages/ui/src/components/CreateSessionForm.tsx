import React, { useState, useMemo } from 'react';

export interface CreateSessionFormData {
  scenarioId: string;
  gmUserId: string;
}

export interface CreateSessionFormProps {
  /** 利用可能なシナリオ一覧 */
  scenarios: Array<{ id: string; name: string; description?: string }>;
  /** 送信ハンドラー */
  onSubmit: (data: CreateSessionFormData) => void;
  /** キャンセルハンドラー */
  onCancel?: () => void;
  /** 送信中フラグ */
  isSubmitting?: boolean;
  /** エラーメッセージ */
  error?: string;
}

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
    <p className="text-red-700 text-sm">{error}</p>
  </div>
);

const ScenarioDescription: React.FC<{ description: string }> = ({ description }) => (
  <p className="mt-2 text-sm text-gray-600">{description}</p>
);

const FormActions: React.FC<{
  onCancel?: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}> = ({ onCancel, isSubmitting, isValid }) => (
  <div className="flex gap-3 pt-4 border-t border-gray-200">
    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="
          flex-1 px-6 py-2 border border-gray-300 rounded-md
          text-gray-700 font-medium
          hover:bg-gray-50 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        キャンセル
      </button>
    )}
    <button
      type="submit"
      disabled={!isValid || isSubmitting}
      className="
        flex-1 px-6 py-2 bg-blue-600 text-white rounded-md font-medium
        hover:bg-blue-700 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {isSubmitting ? '作成中...' : 'セッションを作成'}
    </button>
  </div>
);

export const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
  scenarios,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}) => {
  const [scenarioId, setScenarioId] = useState('');
  const [gmUserId, setGmUserId] = useState('');

  const selectedScenario = useMemo(
    () => scenarios.find((s) => s.id === scenarioId),
    [scenarios, scenarioId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioId || !gmUserId) {
      return;
    }
    onSubmit({ scenarioId, gmUserId });
  };

  const isValid = Boolean(scenarioId && gmUserId);

  return (
    <form
      onSubmit={handleSubmit}
      className="create-session-form max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          新しいセッションを作成
        </h2>

        {error && <ErrorMessage error={error} />}

        {/* シナリオ選択 */}
        <div className="mb-6">
          <label
            htmlFor="scenario"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            シナリオ <span className="text-red-500">*</span>
          </label>
          <select
            id="scenario"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            disabled={isSubmitting}
            className="
              w-full px-4 py-2 border border-gray-300 rounded-md
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
            required
          >
            <option value="">-- シナリオを選択してください --</option>
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
          {selectedScenario?.description && (
            <ScenarioDescription description={selectedScenario.description} />
          )}
        </div>

        {/* GM ユーザー名 */}
        <div className="mb-6">
          <label
            htmlFor="gmUserId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            GM ユーザー名 <span className="text-red-500">*</span>
          </label>
          <input
            id="gmUserId"
            type="text"
            value={gmUserId}
            onChange={(e) => setGmUserId(e.target.value)}
            disabled={isSubmitting}
            placeholder="あなたの名前を入力"
            className="
              w-full px-4 py-2 border border-gray-300 rounded-md
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            セッションのゲームマスターとして表示される名前です
          </p>
        </div>

        {/* アクションボタン */}
        <FormActions
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isValid={isValid}
        />
      </div>
    </form>
  );
};
