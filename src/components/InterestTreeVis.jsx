import React, { useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 60;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export default function InterestTreeVis({ userCategory = 'User', initialInterests = [], aiTreePath = [] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const initialNodes = [];
    const initialEdges = [];

    // Root node
    initialNodes.push({
      id: 'root',
      data: { label: `You (${userCategory})` },
      position: { x: 0, y: 0 },
      className: 'cosmic-node'
    });

    // Layer 1: Static initial interests
    initialInterests.forEach((interest, index) => {
      const nodeId = `initial-${index}`;
      initialNodes.push({
        id: nodeId,
        data: { label: interest },
        position: { x: 0, y: 0 },
        className: 'cosmic-node'
      });

      initialEdges.push({
        id: `edge-root-${index}`,
        source: 'root',
        target: nodeId,
        animated: false,
        style: { stroke: 'var(--color-primary)', strokeWidth: 2 }
      });
    });

    // Layer 2+: Dynamic AI nodes
    // The prompt says "connect sequentially to the primary interest" 
    // We'll connect it to the first initial interest if it exists, otherwise root
    let parentId = initialInterests.length > 0 ? 'initial-0' : 'root';
    
    aiTreePath.forEach((item, index) => {
      const nodeId = `ai-${index}`;
      initialNodes.push({
        id: nodeId,
        data: { label: item },
        position: { x: 0, y: 0 },
        className: 'cosmic-node'
      });

      initialEdges.push({
        id: `edge-ai-${index}`,
        source: parentId,
        target: nodeId,
        animated: true,
        style: { stroke: 'var(--color-primary)', strokeWidth: 2, strokeDasharray: '5 5' }
      });

      parentId = nodeId;
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [userCategory, initialInterests, aiTreePath, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="var(--color-ink-muted)" gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
