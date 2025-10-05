import { Node, Edge } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '@xyflow/react/dist/style.css';

import {
  ScenarioEditorCanvas,
  SceneEditForm,
  SceneFormData,
  ScenarioValidator,
  ValidationMessage,
  ScenarioPreview,
  PreviewScene,
} from '@cartagraph/ui';

import { getScenarioStore, ScenarioMetadata } from '../services/scenario-store';

function createInitialNode(scenarioData: ScenarioMetadata): Node {
  return {
    id: 'scene-initial',
    type: 'scene',
    position: { x: 250, y: 100 },
    data: {
      label: scenarioData.initialSceneName,
      description: scenarioData.description,
      isInitial: true,
      eventCount: 0,
    },
  };
}

function validateScenario(currentNodes: Node[], currentEdges: Edge[]): ValidationMessage[] {
  const results: ValidationMessage[] = [];
  const sceneNodes = currentNodes.filter((n) => n.type === 'scene');
  const initialScenes = sceneNodes.filter((n) => n.data.isInitial);

  if (initialScenes.length === 0) {
    results.push({
      level: 'error',
      message: '開始シーンが設定されていません',
    });
  } else if (initialScenes.length > 1) {
    results.push({
      level: 'warning',
      message: '開始シーンが複数設定されています',
    });
  }

  sceneNodes.forEach((node) => {
    const hasIncomingEdge = currentEdges.some((edge) => edge.target === node.id);
    const data = node.data as { label?: string; isInitial?: boolean };
    if (!data.isInitial && !hasIncomingEdge) {
      results.push({
        level: 'warning',
        message: `シーン「${data.label}」に到達できません`,
        nodeId: node.id,
      });
    }
  });

  return results;
}

function convertToPreviewScenes(nodes: Node[], edges: Edge[]): PreviewScene[] {
  return nodes
    .filter((n) => n.type === 'scene')
    .map((node) => {
      const data = node.data as { label?: string; description?: string };
      return {
        id: node.id,
        name: data.label || 'Untitled Scene',
        description: data.description || '',
        choices: edges
          .filter((edge) => edge.source === node.id)
          .map((edge) => ({
            id: edge.id,
            text: edge.label?.toString() || '次へ',
            nextSceneId: edge.target,
          })),
      };
    });
}

function createNewSceneNode(existingNodesCount: number): Node {
  return {
    id: `scene-${Date.now()}`,
    type: 'scene',
    position: {
      x: 250 + existingNodesCount * 50,
      y: 100 + existingNodesCount * 50,
    },
    data: {
      label: '新しいシーン',
      description: '',
      isInitial: false,
      eventCount: 0,
    },
  };
}

interface LoadingViewProps {
  message: string;
}

function LoadingView({ message }: LoadingViewProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl text-gray-600">{message}</div>
    </div>
  );
}

interface ErrorViewProps {
  error: string;
}

function ErrorView({ error }: ErrorViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-xl text-red-600">{error}</div>
      <Link
        to="/scenarios"
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        シナリオ一覧に戻る
      </Link>
    </div>
  );
}

interface EditorViewProps {
  scenario: ScenarioMetadata;
  scenarioId: string;
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  validationResults: ValidationMessage[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeClick: (nodeId?: string) => void;
  onSceneFormSubmit: (data: SceneFormData) => void;
  onAddScene: () => void;
  onPreview: () => void;
  onCancelEdit: () => void;
}

function EditorView(props: EditorViewProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <Link
            to={`/scenarios/${props.scenarioId}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-1 inline-block"
          >
            ← シナリオ詳細に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{props.scenario.title} - エディター</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={props.onPreview}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
          >
            プレビュー
          </button>
          <button
            onClick={props.onAddScene}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
          >
            + シーン追加
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          <ScenarioEditorCanvas
            nodes={props.nodes}
            edges={props.edges}
            onNodesChange={props.onNodesChange}
            onEdgesChange={props.onEdgesChange}
            readOnly={false}
          />
        </div>

        <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-4">
          {props.selectedNode && (() => {
            const data = props.selectedNode.data as { label?: string; description?: string; isInitial?: boolean };
            return (
              <SceneEditForm
                initialData={{
                  name: data.label || '',
                  description: data.description || '',
                  isInitial: data.isInitial || false,
                }}
                onSubmit={props.onSceneFormSubmit}
                onCancel={props.onCancelEdit}
              />
            );
          })()}

          <ScenarioValidator
            validationResults={props.validationResults}
            onMessageClick={props.onNodeClick}
          />
        </aside>
      </div>
    </div>
  );
}

interface PreviewViewProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

function PreviewView({ nodes, edges, onClose }: PreviewViewProps) {
  const previewScenes = convertToPreviewScenes(nodes, edges);
  const initialScene = previewScenes.find((s) => nodes.find((n) => n.id === s.id)?.data.isInitial);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ScenarioPreview
          scenes={previewScenes}
          initialSceneId={initialScene?.id || previewScenes[0]?.id || ''}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function ScenarioEditor() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [scenario, setScenario] = useState<ScenarioMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationMessage[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    const loadScenario = async () => {
      if (!scenarioId) {
        setError('シナリオIDが指定されていません');
        setIsLoading(false);
        return;
      }

      try {
        const scenarioStore = getScenarioStore();
        const scenarioData = await scenarioStore.getScenario(scenarioId);

        if (!scenarioData) {
          setError('シナリオが見つかりませんでした');
        } else {
          setScenario(scenarioData);
          setNodes([createInitialNode(scenarioData)]);
        }
      } catch (err) {
        console.error('Failed to load scenario:', err);
        setError('シナリオの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadScenario();
  }, [scenarioId]);

  const handleNodesChange = useCallback(
    (updatedNodes: Node[]) => {
      setNodes(updatedNodes);
      setValidationResults(validateScenario(updatedNodes, edges));
    },
    [edges]
  );

  const handleEdgesChange = useCallback(
    (updatedEdges: Edge[]) => {
      setEdges(updatedEdges);
      setValidationResults(validateScenario(nodes, updatedEdges));
    },
    [nodes]
  );

  const handleNodeClick = useCallback(
    (nodeId?: string) => {
      if (nodeId) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          setSelectedNode(node);
        }
      }
    },
    [nodes]
  );

  const handleSceneFormSubmit = (data: SceneFormData) => {
    if (selectedNode) {
      const updatedNodes = nodes.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              label: data.name,
              description: data.description,
              isInitial: data.isInitial,
            },
          };
        }
        return n;
      });
      setNodes(updatedNodes);
      setSelectedNode(null);
    }
  };

  const addNewScene = () => {
    setNodes([...nodes, createNewSceneNode(nodes.length)]);
  };

  if (isLoading) {
    return <LoadingView message="読み込み中..." />;
  }

  if (error || !scenario) {
    return <ErrorView error={error || 'シナリオが見つかりませんでした'} />;
  }

  if (isPreviewMode) {
    return <PreviewView nodes={nodes} edges={edges} onClose={() => setIsPreviewMode(false)} />;
  }

  return (
    <EditorView
      scenario={scenario}
      scenarioId={scenarioId || ''}
      nodes={nodes}
      edges={edges}
      selectedNode={selectedNode}
      validationResults={validationResults}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onNodeClick={handleNodeClick}
      onSceneFormSubmit={handleSceneFormSubmit}
      onAddScene={addNewScene}
      onPreview={() => setIsPreviewMode(true)}
      onCancelEdit={() => setSelectedNode(null)}
    />
  );
}

export default ScenarioEditor;
