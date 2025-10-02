import { PlayerManagementModal } from './PlayerManagementModal';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/PlayerManagementModal',
  component: PlayerManagementModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PlayerManagementModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockPlayers = [
  {
    userId: 'user-1',
    characterName: '勇者アレックス',
    status: 'active' as const,
    joinedAt: '2025-10-01T10:00:00Z',
  },
  {
    userId: 'user-2',
    characterName: '魔法使いベラ',
    status: 'active' as const,
    joinedAt: '2025-10-01T10:15:00Z',
  },
  {
    userId: 'user-3',
    characterName: '戦士カール',
    status: 'pending' as const,
    joinedAt: '2025-10-02T09:30:00Z',
  },
];

export const Default: Story = {
  args: {
    sessionId: 'session-001',
    players: mockPlayers,
    isOpen: true,
    onClose: () => console.log('Close modal'),
    onInvitePlayer: (email) => console.log('Invite player:', email),
    onKickPlayer: (userId) => console.log('Kick player:', userId),
    onChangePlayerStatus: (userId, status) => console.log('Change status:', userId, status),
  },
};

export const EmptyPlayers: Story = {
  args: {
    sessionId: 'session-002',
    players: [],
    isOpen: true,
    onClose: () => console.log('Close modal'),
    onInvitePlayer: (email) => console.log('Invite player:', email),
  },
};

export const WithPendingPlayers: Story = {
  args: {
    sessionId: 'session-003',
    players: [
      {
        userId: 'user-1',
        characterName: '勇者アレックス',
        status: 'active' as const,
        joinedAt: '2025-10-01T10:00:00Z',
      },
      {
        userId: 'user-2',
        characterName: '魔法使いベラ',
        status: 'pending' as const,
        joinedAt: '2025-10-02T09:00:00Z',
      },
      {
        userId: 'user-3',
        characterName: '戦士カール',
        status: 'pending' as const,
        joinedAt: '2025-10-02T09:30:00Z',
      },
    ],
    isOpen: true,
    onClose: () => console.log('Close modal'),
    onInvitePlayer: (email) => console.log('Invite player:', email),
    onKickPlayer: (userId) => console.log('Kick player:', userId),
    onChangePlayerStatus: (userId, status) => console.log('Change status:', userId, status),
  },
};

export const WithKickedPlayers: Story = {
  args: {
    sessionId: 'session-004',
    players: [
      {
        userId: 'user-1',
        characterName: '勇者アレックス',
        status: 'active' as const,
        joinedAt: '2025-10-01T10:00:00Z',
      },
      {
        userId: 'user-2',
        characterName: '魔法使いベラ',
        status: 'kicked' as const,
        joinedAt: '2025-10-01T10:15:00Z',
      },
    ],
    isOpen: true,
    onClose: () => console.log('Close modal'),
    onInvitePlayer: (email) => console.log('Invite player:', email),
    onKickPlayer: (userId) => console.log('Kick player:', userId),
    onChangePlayerStatus: (userId, status) => console.log('Change status:', userId, status),
  },
};

export const AllPlayerTypes: Story = {
  args: {
    sessionId: 'session-005',
    players: [
      {
        userId: 'user-1',
        characterName: '勇者アレックス',
        status: 'active' as const,
        joinedAt: '2025-10-01T10:00:00Z',
      },
      {
        userId: 'user-2',
        characterName: '魔法使いベラ',
        status: 'active' as const,
        joinedAt: '2025-10-01T10:15:00Z',
      },
      {
        userId: 'user-3',
        characterName: '戦士カール',
        status: 'pending' as const,
        joinedAt: '2025-10-02T09:00:00Z',
      },
      {
        userId: 'user-4',
        characterName: '盗賊ダナ',
        status: 'pending' as const,
        joinedAt: '2025-10-02T09:30:00Z',
      },
      {
        userId: 'user-5',
        characterName: '僧侶エリザ',
        status: 'kicked' as const,
        joinedAt: '2025-09-30T15:00:00Z',
      },
    ],
    isOpen: true,
    onClose: () => console.log('Close modal'),
    onInvitePlayer: (email) => console.log('Invite player:', email),
    onKickPlayer: (userId) => console.log('Kick player:', userId),
    onChangePlayerStatus: (userId, status) => console.log('Change status:', userId, status),
  },
};

export const Closed: Story = {
  args: {
    sessionId: 'session-006',
    players: mockPlayers,
    isOpen: false,
    onClose: () => console.log('Close modal'),
  },
};

export const ReadOnly: Story = {
  args: {
    sessionId: 'session-007',
    players: mockPlayers,
    isOpen: true,
    onClose: () => console.log('Close modal'),
    // No actions provided - read-only mode
  },
};
