// ScenarioEditorCanvas - React Flowベースのシナリオエディター
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from '@xyflow/react';
import React, { useCallback } from 'react';
import '@xyflow/react/dist/style.css';
import { EventNode } from './EventNode';
import { SceneNode } from './SceneNode';

export interface ScenarioEditorCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  readOnly?: boolean;
}

const nodeTypes: NodeTypes = {
  scene: SceneNode,
  event: EventNode,
};

export function ScenarioEditorCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  readOnly = false,
}: ScenarioEditorCanvasProps) {
  const [nodes, , handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      onEdgesChange?.(newEdges);
    },
    [edges, setEdges, onEdgesChange]
  );

  const onNodesChangeInternal = useCallback(
    (changes: Parameters<typeof handleNodesChange>[0]) => {
      handleNodesChange(changes);
      onNodesChange?.(nodes);
    },
    [handleNodesChange, nodes, onNodesChange]
  );

  const onEdgesChangeInternal = useCallback(
    (changes: Parameters<typeof handleEdgesChange>[0]) => {
      handleEdgesChange(changes);
      onEdgesChange?.(edges);
    },
    [handleEdgesChange, edges, onEdgesChange]
  );

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChangeInternal}
        onEdgesChange={readOnly ? undefined : onEdgesChangeInternal}
        onConnect={readOnly ? undefined : onConnect}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
