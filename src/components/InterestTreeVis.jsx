import React, { useEffect, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

/**
 * Calculates graph layout positions using a fresh Dagre instance per execution.
 */
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 45, ranksep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function InterestTreeVis({ 
  userCategory = 'User', 
  initialInterests = [], 
  aiTreePath = [] 
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Track layout key to only re-run auto-layout when topology actually changes
  const prevTopologyKeyRef = useRef('');

  useEffect(() => {
    const currentTopologyKey = `${userCategory}|${initialInterests.join(',')}|${aiTreePath.join(',')}`;
    
    // Skip re-layout if topology hasn't changed (prevents snapping back during node drag)
    if (prevTopologyKeyRef.current === currentTopologyKey && nodes.length > 0) {
      return;
    }
    prevTopologyKeyRef.current = currentTopologyKey;

    const initialNodes = [];
    const initialEdges = [];

    // 1. Root node
    initialNodes.push({
      id: 'root',
      data: { label: `👤 ${userCategory || 'Explorer'}` },
      position: { x: 0, y: 0 },
      className: 'cosmic-node',
      style: {
        background: 'var(--note-yellow)',
        border: '2px solid var(--color-ink)',
        borderRadius: '12px',
        fontWeight: 'bold',
        padding: '8px 12px',
        boxShadow: '3px 3px 0px var(--color-ink)'
      }
    });

    // 2. Layer 1: Initial Interest Branches (Solid Lines)
    const activeBranchParentIds = [];

    if (initialInterests.length === 0) {
      const fallbackId = 'initial-fallback';
      initialNodes.push({
        id: fallbackId,
        data: { label: 'General Path' },
        position: { x: 0, y: 0 },
        style: {
          background: 'var(--note-blue)',
          border: '2px solid var(--color-ink)',
          borderRadius: '10px',
          padding: '6px 10px'
        }
      });
      initialEdges.push({
        id: 'edge-root-fallback',
        source: 'root',
        target: fallbackId,
        style: { stroke: 'var(--color-primary)', strokeWidth: 2 }
      });
      activeBranchParentIds.push(fallbackId);
    } else {
      initialInterests.forEach((interest, index) => {
        const nodeId = `initial-${index}`;
        initialNodes.push({
          id: nodeId,
          data: { label: interest },
          position: { x: 0, y: 0 },
          style: {
            background: 'var(--note-blue)',
            border: '2px solid var(--color-ink)',
            borderRadius: '10px',
            fontWeight: '600',
            padding: '6px 10px',
            boxShadow: '2px 2px 0px var(--color-ink)'
          }
        });

        initialEdges.push({
          id: `edge-root-${index}`,
          source: 'root',
          target: nodeId,
          style: { stroke: 'var(--color-primary)', strokeWidth: 2 }
        });

        activeBranchParentIds.push(nodeId);
      });
    }

    // 3. Layer 2+: Dynamic AI Nodes (Round-Robin Branching across initial interests)
    const branchPointers = [...activeBranchParentIds];

    aiTreePath.forEach((item, index) => {
      const nodeId = `ai-${index}`;
      // Round-robin target branch to distribute tree growth evenly
      const targetBranchIndex = index % branchPointers.length;
      const parentId = branchPointers[targetBranchIndex];

      initialNodes.push({
        id: nodeId,
        data: { label: `✨ ${item}` },
        position: { x: 0, y: 0 },
        style: {
          background: 'var(--note-purple)',
          border: '2px solid var(--color-ink)',
          borderRadius: '10px',
          padding: '6px 10px',
          fontSize: '0.9rem',
          boxShadow: '2px 2px 0px var(--color-ink)'
        }
      });

      initialEdges.push({
        id: `edge-ai-${index}`,
        source: parentId,
        target: nodeId,
        animated: true,
        style: { stroke: 'var(--color-primary)', strokeWidth: 2, strokeDasharray: '5 5' }
      });

      // Update pointer for this branch to build deeper sub-branches
      branchPointers[targetBranchIndex] = nodeId;
    });

    // 4. Calculate layout coordinates
    const layout = getLayoutedElements(initialNodes, initialEdges);

    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [userCategory, initialInterests, aiTreePath, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={true}
        nodesConnectable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
      >
        <Background color="var(--color-ink-muted)" gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

