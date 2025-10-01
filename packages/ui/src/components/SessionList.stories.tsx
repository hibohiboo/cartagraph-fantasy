import { SessionList } from './SessionList';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Game/SessionList',
  component: SessionList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SessionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSessions = [
  {
    sessionId: 'abc123def456',
    scenarioId: 'scenario001',
    gmUserId: 'GM太郎',
    status: 'WaitingForPlayers' as const,
    playerCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    sessionId: 'xyz789ghi012',
    scenarioId: 'scenario002',
    gmUserId: 'GM花子',
    status: 'InProgress' as const,
    playerCount: 4,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    sessionId: 'completed123',
    scenarioId: 'scenario003',
    gmUserId: 'GM次郎',
    status: 'Completed' as const,
    playerCount: 5,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const WithTitle: Story = {
  args: {
    sessions: mockSessions,
    title: 'アクティブなセッション',
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};

export const WithoutTitle: Story = {
  args: {
    sessions: mockSessions,
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};

export const Empty: Story = {
  args: {
    sessions: [],
    title: 'セッション一覧',
    emptyMessage: 'まだセッションがありません',
  },
};

export const SingleSession: Story = {
  args: {
    sessions: [mockSessions[0]],
    title: 'プレイヤー募集中',
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};

export const ManySessions: Story = {
  args: {
    sessions: [
      ...mockSessions,
      {
        sessionId: 'session004',
        scenarioId: 'scenario004',
        gmUserId: 'GM三郎',
        status: 'WaitingForPlayers' as const,
        playerCount: 1,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        sessionId: 'session005',
        scenarioId: 'scenario005',
        gmUserId: 'GM四郎',
        status: 'InProgress' as const,
        playerCount: 3,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        sessionId: 'session006',
        scenarioId: 'scenario006',
        gmUserId: 'GM五郎',
        status: 'WaitingForPlayers' as const,
        playerCount: 0,
        createdAt: new Date(Date.now() - 900000).toISOString(),
      },
    ],
    title: '全セッション',
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};

export const OnlyWaitingForPlayers: Story = {
  args: {
    sessions: mockSessions.filter(s => s.status === 'WaitingForPlayers'),
    title: 'プレイヤー募集中のセッション',
    emptyMessage: '現在募集中のセッションはありません',
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};

export const OnlyCompleted: Story = {
  args: {
    sessions: mockSessions.filter(s => s.status === 'Completed'),
    title: '完了したセッション',
    emptyMessage: '完了したセッションはありません',
    onViewSession: (id) => console.log('View session:', id),
  },
};
