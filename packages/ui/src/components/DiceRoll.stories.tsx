import { useState } from 'react';
import { DiceRoll } from './DiceRoll';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DiceRoll> = {
  title: 'Game/DiceRoll',
  component: DiceRoll,
  tags: ['autodocs'],
  argTypes: {
    diceCount: {
      control: { type: 'number', min: 1, max: 10 },
    },
    diceSides: {
      control: { type: 'number', min: 2, max: 20 },
    },
    modifier: {
      control: { type: 'number', min: -10, max: 10 },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    advantage: {
      control: 'select',
      options: ['normal', 'advantage', 'disadvantage'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DiceRoll>;

export const Default: Story = {
  args: {
    diceCount: 2,
    diceSides: 6,
    modifier: 0,
    result: [3, 5],
    total: 8,
    isRolling: false,
    size: 'medium',
    advantage: 'normal',
  },
};

export const WithModifier: Story = {
  args: {
    diceCount: 2,
    diceSides: 6,
    modifier: 3,
    result: [4, 2],
    total: 9,
    isRolling: false,
    size: 'medium',
    advantage: 'normal',
  },
};

export const WithAdvantage: Story = {
  args: {
    diceCount: 2,
    diceSides: 6,
    modifier: 0,
    result: [5, 6],
    total: 11,
    isRolling: false,
    size: 'medium',
    advantage: 'advantage',
  },
};

export const WithDisadvantage: Story = {
  args: {
    diceCount: 2,
    diceSides: 6,
    modifier: 0,
    result: [2, 1],
    total: 3,
    isRolling: false,
    size: 'medium',
    advantage: 'disadvantage',
  },
};

export const Rolling: Story = {
  args: {
    diceCount: 2,
    diceSides: 6,
    modifier: 0,
    isRolling: true,
    size: 'medium',
    advantage: 'normal',
  },
};

export const SmallSize: Story = {
  args: {
    diceCount: 2,
    diceSides: 6,
    modifier: 2,
    result: [3, 4],
    total: 9,
    isRolling: false,
    size: 'small',
    advantage: 'normal',
  },
};

export const LargeSize: Story = {
  args: {
    diceCount: 2,
    diceSides: 6,
    modifier: -1,
    result: [6, 5],
    total: 10,
    isRolling: false,
    size: 'large',
    advantage: 'normal',
  },
};

// InteractiveDiceRoll component extracted to reduce nesting
const InteractiveDiceRoll = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number[] | undefined>([4, 3]);
  const [total, setTotal] = useState<number | undefined>(7);

  const handleRoll = () => {
    setIsRolling(true);
    setResult(undefined);
    setTotal(undefined);

    setTimeout(() => {
      const newResult = [
        // eslint-disable-next-line sonarjs/pseudo-random
        Math.floor(Math.random() * 6) + 1,
        // eslint-disable-next-line sonarjs/pseudo-random
        Math.floor(Math.random() * 6) + 1,
      ];
      const newTotal = newResult.reduce((a, b) => a + b, 0);
      setResult(newResult);
      setTotal(newTotal);
      setIsRolling(false);
    }, 1500);
  };

  return (
    <DiceRoll
      diceCount={2}
      diceSides={6}
      modifier={0}
      result={result}
      total={total}
      isRolling={isRolling}
      onRoll={handleRoll}
      size="medium"
      advantage="normal"
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDiceRoll />,
};

export const MultipleDice: Story = {
  args: {
    diceCount: 3,
    diceSides: 6,
    modifier: 2,
    result: [4, 5, 3],
    total: 14,
    isRolling: false,
    size: 'medium',
    advantage: 'normal',
  },
};

export const D20Roll: Story = {
  args: {
    diceCount: 1,
    diceSides: 20,
    modifier: 5,
    result: [15],
    total: 20,
    isRolling: false,
    size: 'large',
    advantage: 'normal',
  },
};
