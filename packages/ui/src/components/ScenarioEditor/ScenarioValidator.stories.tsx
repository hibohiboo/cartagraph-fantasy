// ScenarioValidator.stories.tsx
import { fn } from '@storybook/test';
import { ScenarioValidator, ValidationMessage } from './ScenarioValidator';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'ScenarioEditor/ScenarioValidator',
  component: ScenarioValidator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onMessageClick: fn(),
  },
} satisfies Meta<typeof ScenarioValidator>;

export default meta;
type Story = StoryObj<typeof meta>;

const errorValidations: ValidationMessage[] = [
  {
    level: 'error',
    message: '開始シーンが設定されていません',
  },
  {
    level: 'error',
    message: 'シーン「暗い通路」に到達不可能です',
    nodeId: 'scene-2',
  },
];

const warningValidations: ValidationMessage[] = [
  {
    level: 'warning',
    message: 'イベント「罠の発動」がどのシーンからも参照されていません',
    nodeId: 'event-3',
  },
  {
    level: 'warning',
    message: 'シーン「宝物庫」から次のシーンへの遷移がありません',
    nodeId: 'scene-5',
  },
];

const infoValidations: ValidationMessage[] = [
  {
    level: 'info',
    message: 'シナリオは10個のシーンで構成されています',
  },
  {
    level: 'info',
    message: '推定プレイ時間: 30-45分',
  },
];

const mixedValidations: ValidationMessage[] = [
  ...errorValidations,
  ...warningValidations,
  ...infoValidations,
];

export const NoErrors: Story = {
  args: {
    validationResults: [],
  },
};

export const ErrorsOnly: Story = {
  args: {
    validationResults: errorValidations,
  },
};

export const WarningsOnly: Story = {
  args: {
    validationResults: warningValidations,
  },
};

export const InfoOnly: Story = {
  args: {
    validationResults: infoValidations,
  },
};

export const MixedResults: Story = {
  args: {
    validationResults: mixedValidations,
  },
};

export const SingleError: Story = {
  args: {
    validationResults: [
      {
        level: 'error',
        message: 'シナリオ名が設定されていません',
      },
    ],
  },
};

export const ClickableValidations: Story = {
  args: {
    validationResults: [
      {
        level: 'error',
        message: 'このエラーをクリックするとノードにジャンプします',
        nodeId: 'scene-1',
      },
      {
        level: 'warning',
        message: 'このエラーをクリックするとエッジにジャンプします',
        edgeId: 'edge-5',
      },
    ],
  },
};

export const ManyValidations: Story = {
  args: {
    validationResults: [
      { level: 'error', message: 'エラー1: 開始シーンが設定されていません' },
      { level: 'error', message: 'エラー2: シーン名が重複しています', nodeId: 'scene-3' },
      { level: 'error', message: 'エラー3: 到達不可能なシーンがあります', nodeId: 'scene-7' },
      { level: 'warning', message: '警告1: 説明が空のシーンがあります', nodeId: 'scene-2' },
      { level: 'warning', message: '警告2: 使用されていないイベントがあります', nodeId: 'event-1' },
      { level: 'warning', message: '警告3: 選択肢が1つしかないシーンがあります', nodeId: 'scene-4' },
      { level: 'warning', message: '警告4: 終了シーンが複数あります' },
      { level: 'info', message: '情報1: シナリオは15シーンで構成されています' },
      { level: 'info', message: '情報2: イベント数: 8個' },
      { level: 'info', message: '情報3: 推定プレイ時間: 45-60分' },
    ],
  },
};
