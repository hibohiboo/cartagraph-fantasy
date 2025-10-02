import { EventLogPanel } from './EventLogPanel';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/EventLogPanel',
  component: EventLogPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EventLogPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEvents = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    type: 'system' as const,
    message: 'ゲームが開始されました',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    type: 'player' as const,
    actor: '勇者アレックス',
    message: '遺跡の入口に近づいた',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    type: 'dice' as const,
    actor: '勇者アレックス',
    message: '知覚判定: 2D6 = 8 (成功)',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    type: 'gm' as const,
    actor: 'GM',
    message: '古代の文字が刻まれた石碑を見つけた',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    type: 'player' as const,
    actor: '魔法使いベラ',
    message: '石碑の文字を解読しようとする',
  },
];

export const Default: Story = {
  args: {
    events: mockEvents,
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};

export const LongHistory: Story = {
  args: {
    events: Array.from({ length: 20 }, (_, i) => ({
      id: `event-${i}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      type: ['system', 'player', 'gm', 'dice'][i % 4] as 'system' | 'player' | 'gm' | 'dice',
      actor: i % 4 === 0 ? undefined : `プレイヤー${i}`,
      message: `イベント ${i + 1} の内容です`,
    })),
    maxHeight: '300px',
  },
};
