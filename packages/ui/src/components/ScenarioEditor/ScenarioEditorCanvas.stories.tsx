// ScenarioEditorCanvas.stories.tsx
import { Node, Edge } from '@xyflow/react';
import { ScenarioEditorCanvas } from './ScenarioEditorCanvas';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'ScenarioEditor/ScenarioEditorCanvas',
  component: ScenarioEditorCanvas,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScenarioEditorCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSceneNodes: Node[] = [
  {
    id: 'scene-1',
    type: 'scene',
    position: { x: 100, y: 100 },
    data: {
      label: '遺跡の入口',
      description: '古びた遺跡の入口に立っている',
      isInitial: true,
      eventCount: 2,
    },
  },
  {
    id: 'scene-2',
    type: 'scene',
    position: { x: 400, y: 100 },
    data: {
      label: '暗い通路',
      description: '松明の明かりで照らされた通路',
      isInitial: false,
      eventCount: 1,
    },
  },
  {
    id: 'scene-3',
    type: 'scene',
    position: { x: 700, y: 100 },
    data: {
      label: '宝物庫',
      description: '金貨と宝石が山積みになっている',
      isInitial: false,
      eventCount: 3,
    },
  },
];

const sampleEventNodes: Node[] = [
  {
    id: 'event-1',
    type: 'event',
    position: { x: 250, y: 250 },
    data: {
      label: '扉を開ける判定',
      type: 'condition',
      description: '筋力判定DC15',
    },
  },
  {
    id: 'event-2',
    type: 'event',
    position: { x: 550, y: 250 },
    data: {
      label: 'トラップ発動',
      type: 'trigger',
      description: '罠が発動してダメージ',
    },
  },
];

const sampleEdges: Edge[] = [
  {
    id: 'edge-1',
    source: 'scene-1',
    target: 'scene-2',
    label: '進む',
  },
  {
    id: 'edge-2',
    source: 'scene-2',
    target: 'scene-3',
    label: '扉を開ける',
  },
  {
    id: 'edge-3',
    source: 'scene-1',
    target: 'event-1',
  },
  {
    id: 'edge-4',
    source: 'event-1',
    target: 'scene-2',
  },
];

export const Empty: Story = {
  args: {
    nodes: [],
    edges: [],
    readOnly: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithScenes: Story = {
  args: {
    nodes: sampleSceneNodes,
    edges: [],
    readOnly: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithScenesAndEdges: Story = {
  args: {
    nodes: sampleSceneNodes,
    edges: sampleEdges.slice(0, 2),
    readOnly: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export const ComplexScenario: Story = {
  args: {
    nodes: [...sampleSceneNodes, ...sampleEventNodes],
    edges: sampleEdges,
    readOnly: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export const ReadOnly: Story = {
  args: {
    nodes: [...sampleSceneNodes, ...sampleEventNodes],
    edges: sampleEdges,
    readOnly: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};
