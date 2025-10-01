import { CreateSessionForm } from './CreateSessionForm';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Game/CreateSessionForm',
  component: CreateSessionForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CreateSessionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockScenarios = [
  {
    id: 'scenario001',
    name: '遺跡の探索',
    description: '古代の遺跡を探索し、隠された宝物を見つけ出す冒険',
  },
  {
    id: 'scenario002',
    name: '闇の森',
    description: '謎に満ちた森で失われた村を探す',
  },
  {
    id: 'scenario003',
    name: 'ドラゴンの洞窟',
    description: '伝説のドラゴンが眠る洞窟への挑戦',
  },
];

export const Default: Story = {
  args: {
    scenarios: mockScenarios,
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export const WithoutCancel: Story = {
  args: {
    scenarios: mockScenarios,
    onSubmit: (data) => console.log('Submit:', data),
  },
};

export const Submitting: Story = {
  args: {
    scenarios: mockScenarios,
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
    isSubmitting: true,
  },
};

export const WithError: Story = {
  args: {
    scenarios: mockScenarios,
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
    error: 'セッションの作成に失敗しました。もう一度お試しください。',
  },
};

export const EmptyScenarios: Story = {
  args: {
    scenarios: [],
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export const SingleScenario: Story = {
  args: {
    scenarios: [mockScenarios[0]],
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export const LongDescription: Story = {
  args: {
    scenarios: [
      {
        id: 'scenario_long',
        name: '壮大な冒険',
        description:
          'これは非常に長い説明文です。シナリオの詳細な背景、目的、推奨プレイヤー数、難易度などが含まれる場合があります。プレイヤーはこの情報を読んでセッションに参加するかどうかを判断します。',
      },
      ...mockScenarios,
    ],
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};
