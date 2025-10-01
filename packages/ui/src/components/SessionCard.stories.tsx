import { SessionCard } from './SessionCard';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Game/SessionCard',
  component: SessionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['WaitingForPlayers', 'InProgress', 'Completed'],
    },
    playerCount: {
      control: { type: 'number', min: 0, max: 10 },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WaitingForPlayers: Story = {
  args: {
    sessionId: 'abc123def456',
    scenarioId: 'scenario001',
    gmUserId: 'GM太郎',
    status: 'WaitingForPlayers',
    playerCount: 2,
    createdAt: new Date().toISOString(),
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};

export const InProgress: Story = {
  args: {
    sessionId: 'xyz789ghi012',
    scenarioId: 'scenario002',
    gmUserId: 'GM花子',
    status: 'InProgress',
    playerCount: 4,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1時間前
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};

export const Completed: Story = {
  args: {
    sessionId: 'completed123',
    scenarioId: 'scenario003',
    gmUserId: 'GM次郎',
    status: 'Completed',
    playerCount: 5,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1日前
    onViewSession: (id) => console.log('View session:', id),
  },
};

export const NoActions: Story = {
  args: {
    sessionId: 'noactions456',
    scenarioId: 'scenario004',
    gmUserId: 'GM三郎',
    status: 'WaitingForPlayers',
    playerCount: 1,
    createdAt: new Date().toISOString(),
  },
};

export const LongIds: Story = {
  args: {
    sessionId: 'very-long-session-id-0123456789abcdef',
    scenarioId: 'very-long-scenario-id-0123456789abcdef',
    gmUserId: 'とても長いユーザー名のGM',
    status: 'InProgress',
    playerCount: 3,
    createdAt: new Date().toISOString(),
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};

export const ZeroPlayers: Story = {
  args: {
    sessionId: 'empty123',
    scenarioId: 'scenario005',
    gmUserId: 'GM四郎',
    status: 'WaitingForPlayers',
    playerCount: 0,
    createdAt: new Date().toISOString(),
    onViewSession: (id) => console.log('View session:', id),
    onManagePlayers: (id) => console.log('Manage players:', id),
  },
};
