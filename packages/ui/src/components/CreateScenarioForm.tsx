import React, { useMemo, useState } from 'react';

export interface CreateScenarioFormData {
  title: string;
  description: string;
  initialSceneName: string;
  authorId: string;
}

export interface CreateScenarioFormProps {
  onSubmit: (data: CreateScenarioFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

const VALIDATION_MESSAGES: Record<keyof CreateScenarioFormData, string> = {
  title: 'タイトルを入力してください',
  description: '説明を入力してください',
  initialSceneName: '初期シーン名を入力してください',
  authorId: '作成者IDを入力してください',
};

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
    <p className="text-sm text-red-600">{message}</p>
  </div>
);

const FormActions: React.FC<{
  isSubmitting: boolean;
  onCancel?: () => void;
}> = ({ isSubmitting, onCancel }) => (
  <div className="flex gap-4 pt-4">
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {isSubmitting ? '作成中...' : 'シナリオを作成'}
    </button>
    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
      >
        キャンセル
      </button>
    )}
  </div>
);

export const CreateScenarioForm: React.FC<CreateScenarioFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}) => {
  const [formData, setFormData] = useState<CreateScenarioFormData>({
    title: '',
    description: '',
    initialSceneName: '',
    authorId: '',
  });

  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof CreateScenarioFormData, string>>
  >({});

  const validateForm = useMemo(
    () => (): boolean => {
      const errors: Partial<Record<keyof CreateScenarioFormData, string>> = {};

      (Object.keys(formData) as Array<keyof CreateScenarioFormData>).forEach(
        (field) => {
          if (!formData[field].trim()) {
            errors[field] = VALIDATION_MESSAGES[field];
          }
        },
      );

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [formData],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    field: keyof CreateScenarioFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          シナリオタイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
          placeholder="例: 遺跡漁りとドブさらい"
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          シナリオ説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
          placeholder="シナリオの概要や雰囲気を説明してください"
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.description}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="initialSceneName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          初期シーン名 <span className="text-red-500">*</span>
        </label>
        <input
          id="initialSceneName"
          type="text"
          value={formData.initialSceneName}
          onChange={(e) => handleChange('initialSceneName', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
          placeholder="例: 酒場での出会い"
        />
        {validationErrors.initialSceneName && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.initialSceneName}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="authorId"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          作成者ID <span className="text-red-500">*</span>
        </label>
        <input
          id="authorId"
          type="text"
          value={formData.authorId}
          onChange={(e) => handleChange('authorId', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
          placeholder="例: user-123"
        />
        {validationErrors.authorId && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.authorId}
          </p>
        )}
      </div>

      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </form>
  );
};
