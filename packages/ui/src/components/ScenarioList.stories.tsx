import { ScenarioList } from './ScenarioList';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/ScenarioList',
  component: ScenarioList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScenarioList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockScenarios = [
  {
    scenarioId: 'scenario-001',
    title: '遺跡漁りとドブさらい',
    description: '古代の遺跡に眠る宝物を求めて、冒険者たちが集まった。',
    initialSceneName: '酒場での出会い',
    createdAt: new Date().toISOString(),
    authorId: 'author-123',
  },
  {
    scenarioId: 'scenario-002',
    title: '闇の森の秘密',
    description: '村の近くにある森で奇妙な事件が起きている。',
    initialSceneName: '村の集会所',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    authorId: 'author-456',
  },
  {
    scenarioId: 'scenario-003',
    title: '竜王の復活',
    description: '数百年前に封印された竜王が復活の兆しを見せている。',
    initialSceneName: '王宮での召喚',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    authorId: 'author-789',
  },
];

export const WithTitle: Story = {
  args: {
    scenarios: mockScenarios,
    title: 'シナリオ一覧',
    onView: (id) => console.log('View:', id),
    onEdit: (id) => console.log('Edit:', id),
    onDelete: (id) => console.log('Delete:', id),
  },
};

export const WithoutTitle: Story = {
  args: {
    scenarios: mockScenarios,
    onView: (id) => console.log('View:', id),
  },
};

export const Empty: Story = {
  args: {
    scenarios: [],
    title: 'シナリオ一覧',
  },
};

export const EmptyWithCustomMessage: Story = {
  args: {
    scenarios: [],
    title: 'マイシナリオ',
    emptyMessage: 'まだシナリオを作成していません',
  },
};

export const SingleScenario: Story = {
  args: {
    scenarios: [mockScenarios[0]],
    title: 'おすすめシナリオ',
    onView: (id) => console.log('View:', id),
  },
};

export const ManyScenarios: Story = {
  args: {
    scenarios: Array.from({ length: 9 }, (_, i) => ({
      scenarioId: `scenario-${i + 1}`,
      title: `シナリオ ${i + 1}`,
      description: `これはシナリオ${i + 1}の説明文です。`,
      initialSceneName: `シーン${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      authorId: `author-${i + 1}`,
    })),
    title: 'すべてのシナリオ',
    onView: (id) => console.log('View:', id),
    onEdit: (id) => console.log('Edit:', id),
  },
};
