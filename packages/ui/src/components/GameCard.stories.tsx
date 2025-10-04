import { GameCard } from './GameCard';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof GameCard> = {
  title: 'Game/GameCard',
  component: GameCard,
  tags: ['autodocs'],
  argTypes: {
    cardType: {
      control: 'select',
      options: ['action', 'choice', 'possession', 'scene_transition'],
    },
    state: {
      control: 'select',
      options: ['normal', 'selected', 'disabled', 'used'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof GameCard>;

export const ActionCard: Story = {
  args: {
    name: '探索',
    cardType: 'action',
    description: '周囲を探索して手がかりを見つける',
    tags: ['探索', 'スキル'],
    state: 'normal',
    size: 'medium',
  },
};

export const ChoiceCard: Story = {
  args: {
    name: '戦う',
    cardType: 'choice',
    description: '敵と戦闘を行う',
    tags: ['戦闘'],
    state: 'normal',
    size: 'medium',
  },
};

export const PossessionCard: Story = {
  args: {
    name: '古びた地図',
    cardType: 'possession',
    description: '遺跡の一部が記された古い地図',
    tags: ['アイテム', '重要'],
    state: 'normal',
    size: 'medium',
  },
};

export const SceneTransitionCard: Story = {
  args: {
    name: '奥の部屋へ',
    cardType: 'scene_transition',
    description: '重い扉を開けて奥の部屋に進む',
    tags: ['移動'],
    state: 'normal',
    size: 'medium',
  },
};

export const SelectedState: Story = {
  args: {
    name: '探索',
    cardType: 'action',
    description: '周囲を探索して手がかりを見つける',
    tags: ['探索', 'スキル'],
    state: 'selected',
    size: 'medium',
  },
};

export const DisabledState: Story = {
  args: {
    name: '探索',
    cardType: 'action',
    description: '周囲を探索して手がかりを見つける',
    tags: ['探索', 'スキル'],
    state: 'disabled',
    size: 'medium',
  },
};

export const UsedState: Story = {
  args: {
    name: '探索',
    cardType: 'action',
    description: '周囲を探索して手がかりを見つける',
    tags: ['探索', 'スキル'],
    state: 'used',
    size: 'medium',
  },
};

export const SmallSize: Story = {
  args: {
    name: '探索',
    cardType: 'action',
    description: '周囲を探索',
    tags: ['探索'],
    state: 'normal',
    size: 'small',
  },
};

export const LargeSize: Story = {
  args: {
    name: '探索',
    cardType: 'action',
    description:
      '周囲を探索して手がかりを見つける。慎重に調べることで隠された情報を発見できるかもしれない。',
    tags: ['探索', 'スキル', '重要'],
    state: 'normal',
    size: 'large',
  },
};

export const CardGroup: Story = {
  render: () => (
    <div className="flex gap-4 p-4 bg-gray-100">
      <GameCard
        name="探索"
        cardType="action"
        description="周囲を探索して手がかりを見つける"
        tags={['探索', 'スキル']}
      />
      <GameCard
        name="戦う"
        cardType="choice"
        description="敵と戦闘を行う"
        tags={['戦闘']}
      />
      <GameCard
        name="古びた地図"
        cardType="possession"
        description="遺跡の一部が記された古い地図"
        tags={['アイテム']}
        state="selected"
      />
    </div>
  ),
};
