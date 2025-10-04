import { PlayerStatus } from './PlayerStatus';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof PlayerStatus> = {
  title: 'Game/PlayerStatus',
  component: PlayerStatus,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['ready', 'in_action', 'waiting_for_input', 'incapacitated'],
    },
    compact: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PlayerStatus>;

export const Ready: Story = {
  args: {
    name: '冒険者アリス',
    status: 'ready',
    tags: ['探索者', '戦士'],
    cardCount: 5,
    compact: false,
  },
};

export const InAction: Story = {
  args: {
    name: '盗賊ボブ',
    status: 'in_action',
    tags: ['盗賊', '敏捷'],
    cardCount: 3,
    compact: false,
  },
};

export const WaitingForInput: Story = {
  args: {
    name: '魔法使いキャロル',
    status: 'waiting_for_input',
    tags: ['魔法使い', '知恵'],
    cardCount: 7,
    compact: false,
  },
};

export const Incapacitated: Story = {
  args: {
    name: '戦士ダン',
    status: 'incapacitated',
    tags: ['戦士', '負傷'],
    cardCount: 2,
    compact: false,
  },
};

export const WithAvatar: Story = {
  args: {
    name: '冒険者アリス',
    status: 'ready',
    tags: ['探索者', '戦士'],
    cardCount: 5,
    avatarUrl: 'https://via.placeholder.com/64',
    compact: false,
  },
};

export const CompactView: Story = {
  args: {
    name: '冒険者アリス',
    status: 'ready',
    tags: ['探索者', '戦士'],
    cardCount: 5,
    compact: true,
  },
};

export const CompactWithAvatar: Story = {
  args: {
    name: '冒険者アリス',
    status: 'ready',
    tags: ['探索者', '戦士'],
    cardCount: 5,
    avatarUrl: 'https://via.placeholder.com/64',
    compact: true,
  },
};

export const NoCards: Story = {
  args: {
    name: '初心者エリック',
    status: 'ready',
    tags: ['初心者'],
    cardCount: 0,
    compact: false,
  },
};

export const ManyTags: Story = {
  args: {
    name: 'ベテラン冒険者フランク',
    status: 'ready',
    tags: ['ベテラン', '探索者', '戦士', '魔法使い', 'リーダー', '幸運'],
    cardCount: 10,
    compact: false,
  },
};

export const PlayerList: Story = {
  render: () => (
    <div className="space-y-3 p-4 bg-gray-100">
      <PlayerStatus
        name="冒険者アリス"
        status="ready"
        tags={['探索者', '戦士']}
        cardCount={5}
        compact={true}
      />
      <PlayerStatus
        name="盗賊ボブ"
        status="in_action"
        tags={['盗賊', '敏捷']}
        cardCount={3}
        compact={true}
      />
      <PlayerStatus
        name="魔法使いキャロル"
        status="waiting_for_input"
        tags={['魔法使い', '知恵']}
        cardCount={7}
        compact={true}
      />
      <PlayerStatus
        name="戦士ダン"
        status="incapacitated"
        tags={['戦士', '負傷']}
        cardCount={2}
        compact={true}
      />
    </div>
  ),
};

export const DetailedPlayerCards: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100">
      <PlayerStatus
        name="冒険者アリス"
        status="ready"
        tags={['探索者', '戦士']}
        cardCount={5}
      />
      <PlayerStatus
        name="盗賊ボブ"
        status="in_action"
        tags={['盗賊', '敏捷']}
        cardCount={3}
      />
      <PlayerStatus
        name="魔法使いキャロル"
        status="waiting_for_input"
        tags={['魔法使い', '知恵']}
        cardCount={7}
      />
      <PlayerStatus
        name="戦士ダン"
        status="incapacitated"
        tags={['戦士', '負傷']}
        cardCount={2}
      />
    </div>
  ),
};
