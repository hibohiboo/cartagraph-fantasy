// SceneEditForm.stories.tsx
import { fn } from '@storybook/test';
import { SceneEditForm } from './SceneEditForm';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'ScenarioEditor/SceneEditForm',
  component: SceneEditForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof SceneEditForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewScene: Story = {
  args: {
    initialData: {},
  },
};

export const EditExistingScene: Story = {
  args: {
    initialData: {
      name: '遺跡の入口',
      description: '古びた遺跡の入口に立っている。扉は半分開いており、中から冷たい風が吹いてくる。',
      isInitial: false,
    },
  },
};

export const InitialScene: Story = {
  args: {
    initialData: {
      name: '物語の始まり',
      description: 'あなたは冒険者ギルドで依頼を受け取った。',
      isInitial: true,
    },
  },
};

export const WithoutCancelButton: Story = {
  args: {
    initialData: {
      name: '重要なシーン',
      description: 'このシーンには重要な選択肢がある。',
      isInitial: false,
    },
    onCancel: undefined,
  },
};

export const LongDescription: Story = {
  args: {
    initialData: {
      name: '詳細なシーン',
      description: `あなたは広大な洞窟の中にいる。

天井からは鍾乳石が垂れ下がり、足元には水たまりが点在している。
遠くから微かに水の流れる音が聞こえてくる。

洞窟の奥には３つの通路が見える：
- 左の通路は暗く、冷たい空気が流れている
- 中央の通路は明るく、松明の光が見える
- 右の通路は狭く、何か甘い香りがする`,
      isInitial: false,
    },
  },
};
