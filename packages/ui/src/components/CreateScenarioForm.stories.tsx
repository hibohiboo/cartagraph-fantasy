import { CreateScenarioForm } from './CreateScenarioForm';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/CreateScenarioForm',
  component: CreateScenarioForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CreateScenarioForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export const WithError: Story = {
  args: {
    error: 'シナリオの作成に失敗しました。もう一度お試しください。',
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export const WithoutCancel: Story = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
  },
};
