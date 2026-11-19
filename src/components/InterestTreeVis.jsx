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

const DOMAIN_KEYWORDS = {
  web: ['web', 'frontend', 'backend', 'fullstack', 'react', 'vue', 'angular', 'svelte', 'css', 'html', 'javascript', 'typescript', 'node', 'express', 'api', 'nextjs', 'tailwind', 'dom', 'browser', 'redux'],
  data: ['data', 'ml', 'ai', 'machine learning', 'deep learning', 'neural', 'python', 'pandas', 'numpy', 'model', 'nlp', 'computer vision', 'dataset', 'pytorch', 'tensorflow', 'scikit', 'analytics'],
  mobile: ['mobile', 'app', 'ios', 'android', 'swift', 'flutter', 'react native', 'kotlin', 'expo'],
  security: ['security', 'cyber', 'cybersecurity', 'hack', 'penetration', 'auth', 'network', 'firewall', 'encryption', 'vulnerability', 'owasp', 'crypto'],
  cloud: ['cloud', 'devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'terraform', 'linux', 'server', 'deployment', 'infra'],
  game: ['game', 'unity', 'unreal', 'godot', 'shader', '3d', 'physics', 'c#', 'c++', 'rendering'],
  design: ['design', 'ui', 'ux', 'figma', 'wireframe', 'color', 'typography', 'prototype', 'animation'],
  blockchain: ['blockchain', 'solidity', 'crypto', 'web3', 'ethereum', 'smart contract']
};

/**
 * Finds the best matching parent node id from already registered nodes in the tree.
 */
function findParentNodeId(rawParent, label, registeredNodes) {
  if (registeredNodes.length === 0) return 'root';

  // 1. If explicit parent name is provided
  if (rawParent && typeof rawParent === 'string') {
    const cleanP = rawParent.trim().toLowerCase();

    // Check direct ID match
    const idMatch = registeredNodes.find(n => n.id === rawParent);
    if (idMatch) return idMatch.id;

    // Check exact label match (case-insensitive)
    const exactMatch = registeredNodes.find(n => n.label.trim().toLowerCase() === cleanP);
    if (exactMatch) return exactMatch.id;

    // Check contains match
    const containsMatch = registeredNodes.find(n => {
      const nl = n.label.trim().toLowerCase();
      return nl.includes(cleanP) || cleanP.includes(nl);
    });
    if (containsMatch) return containsMatch.id;
  }

  // 2. Semantic matching against non-root nodes
  const candidates = registeredNodes.filter(n => n.id !== 'root');
  if (candidates.length === 0) return 'root';

  const contextText = `${rawParent || ''} ${label || ''}`.toLowerCase();
  let bestCandidate = candidates[0];
  let highestScore = -1;

  candidates.forEach(cand => {
    let score = 0;
    const candLower = cand.label.toLowerCase();

    // Word tokens overlap
    const tokens = candLower.split(/\W+/).filter(w => w.length > 2);
    tokens.forEach(tok => {
      if (contextText.includes(tok)) score += 4;
    });

    // Domain keywords overlap
    Object.values(DOMAIN_KEYWORDS).forEach(keywords => {
      const candInDomain = keywords.some(k => candLower.includes(k));
      if (candInDomain) {
        keywords.forEach(kw => {
          if (contextText.includes(kw)) score += 2;
        });
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestCandidate = cand;
    }
  });

  return bestCandidate.id;
}

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
    const currentTopologyKey = `${userCategory}|${initialInterests.join(',')}|${JSON.stringify(aiTreePath)}`;
    
    // Skip re-layout if topology hasn't changed (prevents snapping back during node drag)
    if (prevTopologyKeyRef.current === currentTopologyKey && nodes.length > 0) {
      return;
    }
    prevTopologyKeyRef.current = currentTopologyKey;

    const initialNodes = [];
    const initialEdges = [];
    const registeredNodes = []; // Tracks nodes to resolve parents accurately: { id, label }

    // 1. Root node
    const rootNode = {
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
    };
    initialNodes.push(rootNode);
    registeredNodes.push({ id: 'root', label: userCategory || 'Explorer' });

    // 2. Layer 1: Initial Interest Branches (Solid Lines)
    if (initialInterests.length === 0) {
      const fallbackId = 'initial-fallback';
      initialNodes.push({
        id: fallbackId,
        data: { label: 'General Focus' },
        position: { x: 0, y: 0 },
        style: {
          background: 'var(--note-blue)',
          border: '2px solid var(--color-ink)',
          borderRadius: '10px',
          padding: '6px 10px',
          fontWeight: '600',
          boxShadow: '2px 2px 0px var(--color-ink)'
        }
      });
      initialEdges.push({
        id: 'edge-root-fallback',
        source: 'root',
        target: fallbackId,
        style: { stroke: 'var(--color-primary)', strokeWidth: 2 }
      });
      registeredNodes.push({ id: fallbackId, label: 'General Focus' });
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

        registeredNodes.push({ id: nodeId, label: interest });
      });
    }

    // 3. Layer 2+: Dynamic AI Nodes with Exact & Semantic Parent Assignment
    const PASTEL_COLORS = [
      'var(--note-green)',
      'var(--note-purple)',
      'var(--note-orange)',
      'var(--note-rose)',
      'var(--note-yellow)'
    ];

    aiTreePath.forEach((item, index) => {
      const nodeId = `ai-${index}`;
      const label = typeof item === 'string' ? item : (item.label || item.treeNodeLabel || 'Specialization');
      const rawParent = typeof item === 'object' ? (item.parent || item.parentNode) : null;

      // Find the authentic parent node
      const parentId = findParentNodeId(rawParent, label, registeredNodes);

      const nodeBg = PASTEL_COLORS[index % PASTEL_COLORS.length];

      initialNodes.push({
        id: nodeId,
        data: { label: `✨ ${label}` },
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

      // Register this node so subsequent sub-questions can branch from it if applicable
      registeredNodes.push({ id: nodeId, label });
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

