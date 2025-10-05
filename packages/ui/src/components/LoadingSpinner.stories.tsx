import { LoadingSpinner, ErrorMessage, EmptyState } from './LoadingSpinner';
import type { Meta, StoryObj } from '@storybook/react';

const spinnerMeta = {
  title: 'Layout/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingSpinner>;

export default spinnerMeta;
type SpinnerStory = StoryObj<typeof spinnerMeta>;

export const SmallSpinner: SpinnerStory = {
  args: {
    size: 'sm',
  },
};

export const MediumSpinner: SpinnerStory = {
  args: {
    size: 'md',
  },
};

export const LargeSpinner: SpinnerStory = {
  args: {
    size: 'lg',
  },
};

export const WithMessage: SpinnerStory = {
  args: {
    size: 'md',
    message: 'データを読み込んでいます...',
  },
};

export const FullscreenSpinner: SpinnerStory = {
  args: {
    size: 'lg',
    message: '処理中です。しばらくお待ちください...',
    fullscreen: true,
  },
};

// Error Message stories
const _errorMeta = {
  title: 'Layout/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorMessage>;

export const ErrorVariant: StoryObj<typeof _errorMeta> = {
  args: {
    title: 'エラーが発生しました',
    message: 'データの読み込みに失敗しました。ネットワーク接続を確認してください。',
    variant: 'error',
    onRetry: () => alert('再試行'),
    onDismiss: () => alert('閉じる'),
  },
};

export const WarningVariant: StoryObj<typeof _errorMeta> = {
  args: {
    title: '警告',
    message: '一部のデータが古い可能性があります。',
    variant: 'warning',
    onDismiss: () => alert('閉じる'),
  },
};

export const InfoVariant: StoryObj<typeof _errorMeta> = {
  args: {
    title: 'お知らせ',
    message: 'システムメンテナンスのため、一部機能が制限されています。',
    variant: 'info',
    onDismiss: () => alert('閉じる'),
  },
};

export const ErrorWithoutActions: StoryObj<typeof _errorMeta> = {
  args: {
    title: 'エラー',
    message: '予期しないエラーが発生しました。',
    variant: 'error',
  },
};

export const ErrorWithRetryOnly: StoryObj<typeof _errorMeta> = {
  args: {
    title: '接続エラー',
    message: 'サーバーに接続できませんでした。',
    variant: 'error',
    onRetry: () => alert('再試行'),
  },
};

// Empty State stories
const _emptyMeta = {
  title: 'Layout/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export const EmptyWithIcon: StoryObj<typeof _emptyMeta> = {
  args: {
    icon: '📭',
    title: 'データがありません',
    description: 'まだデータが登録されていません。新しいデータを作成してください。',
    action: {
      label: '新規作成',
      onClick: () => alert('新規作成'),
    },
  },
};

export const EmptySessionList: StoryObj<typeof _emptyMeta> = {
  args: {
    icon: '🎲',
    title: 'セッションがありません',
    description: 'まだセッションが作成されていません。新しいセッションを開始しましょう。',
    action: {
      label: 'セッションを作成',
      onClick: () => alert('セッション作成'),
    },
  },
};

export const EmptyCharacterList: StoryObj<typeof _emptyMeta> = {
  args: {
    icon: '👤',
    title: 'キャラクターがいません',
    description: 'キャラクターを作成して冒険を始めましょう。',
    action: {
      label: 'キャラクターを作成',
      onClick: () => alert('キャラクター作成'),
    },
  },
};

export const EmptyScenarioList: StoryObj<typeof _emptyMeta> = {
  args: {
    icon: '📖',
    title: 'シナリオがありません',
    description: 'シナリオを作成して物語を紡ぎましょう。',
    action: {
      label: 'シナリオを作成',
      onClick: () => alert('シナリオ作成'),
    },
  },
};

export const EmptyWithoutAction: StoryObj<typeof _emptyMeta> = {
  args: {
    icon: '🔍',
    title: '検索結果がありません',
    description: '条件に一致するアイテムが見つかりませんでした。',
  },
};

export const EmptyWithoutIcon: StoryObj<typeof _emptyMeta> = {
  args: {
    title: 'データがありません',
    description: 'このページには表示するデータがありません。',
  },
};

// Combined usage example
export const LoadingStates: StoryObj = {
  render: () => (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Loading Spinners</h3>
        <div className="flex items-center gap-8 p-4 bg-gray-50 rounded">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" message="読み込み中..." />
          <LoadingSpinner size="lg" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Error Messages</h3>
        <div className="space-y-4">
          <ErrorMessage
            title="エラー"
            message="データの読み込みに失敗しました。"
            variant="error"
            onRetry={() => alert('再試行')}
            onDismiss={() => alert('閉じる')}
          />
          <ErrorMessage
            title="警告"
            message="一部のデータが利用できません。"
            variant="warning"
            onDismiss={() => alert('閉じる')}
          />
          <ErrorMessage
            title="情報"
            message="新しいバージョンが利用可能です。"
            variant="info"
            onDismiss={() => alert('閉じる')}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Empty States</h3>
        <div className="border rounded-lg">
          <EmptyState
            icon="📭"
            title="データがありません"
            description="まだデータが登録されていません。"
            action={{
              label: '新規作成',
              onClick: () => alert('新規作成'),
            }}
          />
        </div>
      </div>
    </div>
  ),
};
