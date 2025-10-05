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
  NodeTypes,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import React, { useCallback } from 'react';
import '@xyflow/react/dist/style.css';
import { EventNode } from './EventNode';
import { SceneNode } from './SceneNode';

export interface ScenarioEditorCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  readOnly?: boolean;
}

const nodeTypes: NodeTypes = {
  scene: SceneNode,
  event: EventNode,
};

export function ScenarioEditorCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  readOnly = false,
}: ScenarioEditorCanvasProps) {
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      onEdgesChange?.(newEdges);
    },
    [edges, onEdgesChange]
  );

  const handleNodesChangeInternal = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      onNodesChange?.(updatedNodes);
    },
    [nodes, onNodesChange]
  );

  const handleEdgesChangeInternal = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      onEdgesChange?.(updatedEdges);
    },
    [edges, onEdgesChange]
  );

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChangeInternal}
        onEdgesChange={readOnly ? undefined : handleEdgesChangeInternal}
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
