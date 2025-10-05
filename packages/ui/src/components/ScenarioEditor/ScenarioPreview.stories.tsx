// ScenarioPreview.stories.tsx
import { fn } from '@storybook/test';
import { ScenarioPreview, PreviewScene } from './ScenarioPreview';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'ScenarioEditor/ScenarioPreview',
  component: ScenarioPreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof ScenarioPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const simpleScenario: PreviewScene[] = [
  {
    id: 'scene-1',
    name: '物語の始まり',
    description: 'あなたは冒険者ギルドで依頼を受け取った。\n古い遺跡に眠る財宝を探してほしいとのことだ。',
    choices: [
      {
        id: 'choice-1',
        text: '遺跡へ向かう',
        nextSceneId: 'scene-2',
      },
      {
        id: 'choice-2',
        text: '準備をしてから向かう',
        nextSceneId: 'scene-3',
      },
    ],
  },
  {
    id: 'scene-2',
    name: '遺跡の入口',
    description: '古びた遺跡の入口に到着した。\n扉は半分開いており、中から冷たい風が吹いてくる。',
    choices: [
      {
        id: 'choice-3',
        text: '中に入る',
        nextSceneId: 'scene-4',
      },
      {
        id: 'choice-4',
        text: '周辺を調査する',
        nextSceneId: 'scene-5',
      },
    ],
  },
  {
    id: 'scene-3',
    name: '準備',
    description: '街で装備を整えた。\n松明とロープ、それに薬草を購入した。',
    choices: [
      {
        id: 'choice-5',
        text: '遺跡へ向かう',
        nextSceneId: 'scene-2',
      },
    ],
  },
  {
    id: 'scene-4',
    name: '暗い通路',
    description: '松明の明かりで照らされた通路を進む。\n壁には古代文字が刻まれている。',
    choices: [],
  },
  {
    id: 'scene-5',
    name: '周辺調査',
    description: '遺跡の周りを調べると、別の入口を発見した。\nこちらは比較的新しい痕跡がある。',
    choices: [
      {
        id: 'choice-6',
        text: '別の入口から入る',
        nextSceneId: 'scene-6',
      },
      {
        id: 'choice-7',
        text: '正面入口に戻る',
        nextSceneId: 'scene-2',
      },
    ],
  },
  {
    id: 'scene-6',
    name: '秘密の通路',
    description: '別の入口は秘密の通路に繋がっていた。\n直接宝物庫に通じているようだ。',
    choices: [],
  },
];

const conditionalScenario: PreviewScene[] = [
  {
    id: 'scene-1',
    name: '扉の前',
    description: '重厚な扉が立ちはだかる。',
    choices: [
      {
        id: 'choice-1',
        text: '力ずくで開ける',
        nextSceneId: 'scene-2',
        condition: '筋力 >= 15',
      },
      {
        id: 'choice-2',
        text: '鍵を探す',
        nextSceneId: 'scene-3',
      },
      {
        id: 'choice-3',
        text: '魔法で開ける',
        nextSceneId: 'scene-4',
        condition: '魔法使いクラス',
      },
    ],
  },
  {
    id: 'scene-2',
    name: '力ずくで成功',
    description: '筋力で扉をこじ開けた！',
    choices: [],
  },
  {
    id: 'scene-3',
    name: '鍵を発見',
    description: '近くの壺の中に鍵を見つけた。',
    choices: [],
  },
  {
    id: 'scene-4',
    name: '魔法で解錠',
    description: '魔法で鍵を解除した。',
    choices: [],
  },
];

export const SimpleScenario: Story = {
  args: {
    scenes: simpleScenario,
    initialSceneId: 'scene-1',
  },
};

export const WithConditions: Story = {
  args: {
    scenes: conditionalScenario,
    initialSceneId: 'scene-1',
  },
};

export const NoChoices: Story = {
  args: {
    scenes: [
      {
        id: 'scene-1',
        name: 'エンディング',
        description: 'あなたは財宝を手に入れ、無事に帰還した。\n\nおめでとう！',
        choices: [],
      },
    ],
    initialSceneId: 'scene-1',
  },
};

export const SingleChoice: Story = {
  args: {
    scenes: [
      {
        id: 'scene-1',
        name: '一本道',
        description: '進むしかない。',
        choices: [
          {
            id: 'choice-1',
            text: '進む',
            nextSceneId: 'scene-2',
          },
        ],
      },
      {
        id: 'scene-2',
        name: '次のシーン',
        description: '先に進んだ。',
        choices: [],
      },
    ],
    initialSceneId: 'scene-1',
  },
};

export const LongDescription: Story = {
  args: {
    scenes: [
      {
        id: 'scene-1',
        name: '宝物庫',
        description: `あなたは広大な宝物庫に足を踏み入れた。

目の前には金貨、銀貨が山のように積まれている。
宝石や魔法のアイテムも無数に散らばっている。

しかし、部屋の中央には巨大なドラゴンが眠っている。
その寝息だけで部屋全体が震えている。

どうする？`,
        choices: [
          {
            id: 'choice-1',
            text: '静かに宝を盗む',
            nextSceneId: 'scene-2',
            condition: '隠密 >= 18',
          },
          {
            id: 'choice-2',
            text: 'ドラゴンと戦う',
            nextSceneId: 'scene-3',
          },
          {
            id: 'choice-3',
            text: '諦めて立ち去る',
            nextSceneId: 'scene-4',
          },
        ],
      },
      {
        id: 'scene-2',
        name: '成功',
        description: '静かに宝を盗むことに成功した！',
        choices: [],
      },
      {
        id: 'scene-3',
        name: '戦闘',
        description: 'ドラゴンが目を覚ました！',
        choices: [],
      },
      {
        id: 'scene-4',
        name: '撤退',
        description: '無事に逃げることができた。',
        choices: [],
      },
    ],
    initialSceneId: 'scene-1',
  },
};

export const ErrorSceneNotFound: Story = {
  args: {
    scenes: simpleScenario,
    initialSceneId: 'invalid-scene-id',
  },
};

export const WithoutCloseButton: Story = {
  args: {
    scenes: simpleScenario,
    initialSceneId: 'scene-1',
    onClose: undefined,
  },
};
