import { DiceRollPanel } from './DiceRollPanel';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/DiceRollPanel',
  component: DiceRollPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DiceRollPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onRoll: (result) => console.log('Dice rolled:', result),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
