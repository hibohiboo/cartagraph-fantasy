import { ScenarioCard } from './ScenarioCard';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/ScenarioCard',
  component: ScenarioCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScenarioCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    scenarioId: 'scenario-001',
    title: '遺跡漁りとドブさらい',
    description: '古代の遺跡に眠る宝物を求めて、冒険者たちが集まった。しかし遺跡の奥深くには危険な罠と強敵が待ち受けている。',
    initialSceneName: '酒場での出会い',
    createdAt: new Date().toISOString(),
    authorId: 'author-123',
    onView: (id) => console.log('View:', id),
    onEdit: (id) => console.log('Edit:', id),
    onDelete: (id) => console.log('Delete:', id),
  },
};

export const WithoutInitialScene: Story = {
  args: {
    scenarioId: 'scenario-002',
    title: '闇の森の秘密',
    description: '村の近くにある森で奇妙な事件が起きている。調査に向かった冒険者たちは、予想外の真実に直面する。',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    authorId: 'author-456',
    onView: (id) => console.log('View:', id),
  },
};

export const LongDescription: Story = {
  args: {
    scenarioId: 'scenario-003',
    title: '竜王の復活',
    description:
      '数百年前に封印された竜王が復活の兆しを見せている。世界を救うため、選ばれし勇者たちは竜王の封印を強化する旅に出る。道中では様々な試練が待ち受け、仲間との絆が試される。果たして彼らは世界を救うことができるのか。',
    initialSceneName: '王宮での召喚',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    authorId: 'author-789',
    onView: (id) => console.log('View:', id),
    onEdit: (id) => console.log('Edit:', id),
    onDelete: (id) => console.log('Delete:', id),
  },
};

export const NoActions: Story = {
  args: {
    scenarioId: 'scenario-004',
    title: '港町の陰謀',
    description: '賑やかな港町で密輸組織の噂が流れている。真相を探るため、冒険者たちは潜入調査を開始する。',
    initialSceneName: '港の倉庫',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    authorId: 'author-321',
  },
};

export const ViewOnly: Story = {
  args: {
    scenarioId: 'scenario-005',
    title: '氷の塔',
    description: '雪山の頂上に聳え立つ謎の塔。そこには失われた魔法の書が眠っているという。',
    initialSceneName: '雪山の麓',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    authorId: 'author-654',
    onView: (id) => console.log('View:', id),
  },
};
