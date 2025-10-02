import { CreateCharacterForm } from './CreateCharacterForm';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/CreateCharacterForm',
  component: CreateCharacterForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CreateCharacterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export const WithoutCancel: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
  },
};

export const Submitting: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
    isSubmitting: true,
  },
};

export const WithError: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
    error: 'キャラクターの作成に失敗しました。もう一度お試しください。',
  },
};
