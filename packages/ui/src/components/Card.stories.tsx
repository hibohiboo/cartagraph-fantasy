import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'elevated'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Default Card',
    children: 'This is a default card with some content.',
    variant: 'default',
  },
};

export const Bordered: Story = {
  args: {
    title: 'Bordered Card',
    children: 'This is a bordered card with a visible border.',
    variant: 'bordered',
  },
};

export const Elevated: Story = {
  args: {
    title: 'Elevated Card',
    children: 'This is an elevated card with a shadow.',
    variant: 'elevated',
  },
};

export const NoTitle: Story = {
  args: {
    children: 'This card has no title.',
    variant: 'default',
  },
};

export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    children: 'This card is clickable with hover effects.',
    variant: 'elevated',
    onClick: () => alert('Card clicked!'),
  },
};

export const LongContent: Story = {
  args: {
    title: 'Card with Long Content',
    children: (
      <div>
        <p className="mb-2">This card contains multiple paragraphs of content.</p>
        <p className="mb-2">It demonstrates how the card handles longer text content and maintains proper spacing.</p>
        <p>The card automatically adjusts its height based on the content.</p>
      </div>
    ),
    variant: 'bordered',
  },
};