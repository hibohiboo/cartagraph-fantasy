import { SceneDisplay } from './SceneDisplay';
import type { Meta, StoryObj } from '@storybook/react';


const meta = {
  title: 'Components/SceneDisplay',
  component: SceneDisplay,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SceneDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sceneName: '遺跡の入口',
    description: '古代の遺跡の入口に到着した。石造りの門は半分崩れているが、奥への道は続いている。',
    objective: '遺跡の奥に進み、隠された宝物を見つける',
  },
};

export const WithoutObjective: Story = {
  args: {
    sceneName: '闇の森',
    description: '深い森の中、木々が密集して太陽の光をほとんど遮っている。遠くから奇妙な音が聞こえる。',
  },
};

export const LongDescription: Story = {
  args: {
    sceneName: 'ドラゴンの洞窟',
    description:
      '巨大な洞窟の入口が目の前に広がる。中からは熱気が漂い、かすかに宝石の輝きが見える。洞窟の壁には古代文字が刻まれており、「ここに眠るは千年の守護者、真なる勇者のみがその宝を手にする資格を持つ」と書かれている。足元には以前の冒険者のものと思われる装備が散乱している。',
    objective: '伝説のドラゴンを倒し、古代の宝を手に入れる',
  },
};

export const ShortScene: Story = {
  args: {
    sceneName: '休息所',
    description: '安全な場所を見つけた。',
    objective: '体力を回復する',
  },
};
