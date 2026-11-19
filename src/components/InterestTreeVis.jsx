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

    // 3. Layer 2+: Dynamic AI Nodes with Broad Multi-Child Branching
    // Each parent node can host multiple children (e.g. 2-3 children), fanning out broadly.
    const parentChildrenCount = {};
    activeBranchParentIds.forEach((pid) => {
      parentChildrenCount[pid] = 0;
    });

    const availableParents = [...activeBranchParentIds];
    const MAX_CHILDREN_PER_NODE = 2;

    const PASTEL_COLORS = [
      'var(--note-green)',
      'var(--note-purple)',
      'var(--note-orange)',
      'var(--note-rose)',
      'var(--note-yellow)'
    ];

    aiTreePath.forEach((item, index) => {
      const nodeId = `ai-${index}`;

      // Distribute to the parent with fewest children to create a balanced, broad tree
      let parentId = availableParents[0];
      for (const candidate of availableParents) {
        if ((parentChildrenCount[candidate] || 0) < (parentChildrenCount[parentId] || 0)) {
          parentId = candidate;
        }
      }

      parentChildrenCount[parentId] = (parentChildrenCount[parentId] || 0) + 1;

      // If parent has reached max capacity, rotate it out if other parents exist
      if (parentChildrenCount[parentId] >= MAX_CHILDREN_PER_NODE) {
        const pIdx = availableParents.indexOf(parentId);
        if (pIdx !== -1 && availableParents.length > 1) {
          availableParents.splice(pIdx, 1);
        }
      }

      // Add newly created node as a parent candidate for subsequent levels
      availableParents.push(nodeId);
      parentChildrenCount[nodeId] = 0;

      const nodeBg = PASTEL_COLORS[index % PASTEL_COLORS.length];

      initialNodes.push({
        id: nodeId,
        data: { label: `✨ ${item}` },
        position: { x: 0, y: 0 },
        style: {
          background: nodeBg,
          border: '2px solid var(--color-ink)',
          borderRadius: '10px',
          padding: '6px 12px',
          fontSize: '0.9rem',
          fontWeight: '600',
          boxShadow: '2px 2px 0px var(--color-ink)'
        }
      });

      initialEdges.push({
        id: `edge-ai-${index}`,
        source: parentId,
        target: nodeId,
        animated: true,
        style: { stroke: 'var(--color-primary)', strokeWidth: 2, strokeDasharray: '4 4' }
      });
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

