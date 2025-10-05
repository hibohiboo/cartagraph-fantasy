// SceneEditForm - シーン編集フォーム
import React, { useState } from 'react';

export interface SceneFormData {
  name: string;
  description: string;
  isInitial: boolean;
}

export interface SceneEditFormProps {
  initialData?: Partial<SceneFormData>;
  onSubmit: (data: SceneFormData) => void;
  onCancel?: () => void;
}

interface FormFieldProps {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, id, required, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required ? '*' : ''}
      </label>
      {children}
    </div>
  );
}

function FormButtons({ onCancel }: { onCancel?: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        type="submit"
        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold"
      >
        保存
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
        >
          キャンセル
        </button>
      )}
    </div>
  );
}

export function SceneEditForm({ initialData, onSubmit, onCancel }: SceneEditFormProps) {
  const [formData, setFormData] = useState<SceneFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    isInitial: initialData?.isInitial || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900">シーン編集</h3>

      <FormField label="シーン名" id="scene-name" required>
        <input
          id="scene-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: 遺跡の入口"
        />
      </FormField>

      <FormField label="説明" id="scene-description">
        <textarea
          id="scene-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="シーンの詳細を入力..."
        />
      </FormField>

      <div className="flex items-center gap-2">
        <input
          id="scene-initial"
          type="checkbox"
          checked={formData.isInitial}
          onChange={(e) => setFormData({ ...formData, isInitial: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="scene-initial" className="text-sm text-gray-700">
          開始シーンに設定
        </label>
      </div>

      <FormButtons onCancel={onCancel} />
    </form>
  );
}
