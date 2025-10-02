import { CharacterCard } from './CharacterCard';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/CharacterCard',
  component: CharacterCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CharacterCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    characterId: 'char-001',
    name: '勇者アレックス',
    playerId: 'player-123',
    createdAt: '2025-10-01T10:00:00Z',
    onSelect: (id) => console.log('Select character:', id),
    onDelete: (id) => console.log('Delete character:', id),
  },
};

export const LongName: Story = {
  args: {
    characterId: 'char-002',
    name: '闇の森に住む伝説の魔法使いベラドンナ・ムーンシャドウ',
    playerId: 'player-456',
    createdAt: '2025-09-15T14:30:00Z',
    onSelect: (id) => console.log('Select character:', id),
    onDelete: (id) => console.log('Delete character:', id),
  },
};

export const WithoutActions: Story = {
  args: {
    characterId: 'char-003',
    name: '戦士カール',
    playerId: 'player-789',
    createdAt: '2025-08-20T09:15:00Z',
  },
};

export const OnlySelect: Story = {
  args: {
    characterId: 'char-004',
    name: '盗賊ダナ',
    playerId: 'player-321',
    createdAt: '2025-10-02T11:45:00Z',
    onSelect: (id) => console.log('Select character:', id),
  },
};

export const OnlyDelete: Story = {
  args: {
    characterId: 'char-005',
    name: '僧侶エリザ',
    playerId: 'player-654',
    createdAt: '2025-09-30T16:20:00Z',
    onDelete: (id) => console.log('Delete character:', id),
  },
};

export const RecentlyCreated: Story = {
  args: {
    characterId: 'char-006',
    name: '吟遊詩人フィン',
    playerId: 'player-987',
    createdAt: new Date().toISOString(),
    onSelect: (id) => console.log('Select character:', id),
    onDelete: (id) => console.log('Delete character:', id),
  },
};
