import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NODE_WIDTH = 130;
const NODE_HEIGHT = 44;
const LEVEL_HEIGHT = 80;

const PASTEL_COLORS = [
  colors.noteYellow,
  colors.noteBlue,
  colors.noteGreen,
  colors.notePurple,
  colors.noteOrange,
  colors.noteRose,
];

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
 * Finds the best matching parent node id from registered nodes in the tree.
 */
function findParentNodeId(rawParent, label, registeredNodes) {
  if (!registeredNodes || registeredNodes.length === 0) return 'root';

  // 1. If explicit parent name is provided
  if (rawParent && typeof rawParent === 'string') {
    const cleanP = rawParent.trim().toLowerCase();

    // Check direct ID match
    const idMatch = registeredNodes.find((n) => n.id === rawParent);
    if (idMatch) return idMatch.id;

    // Check exact label match (case-insensitive)
    const exactMatch = registeredNodes.find(
      (n) => n.label.trim().toLowerCase() === cleanP
    );
    if (exactMatch) return exactMatch.id;

    // Check contains match
    const containsMatch = registeredNodes.find((n) => {
      const nl = n.label.trim().toLowerCase();
      return nl.includes(cleanP) || cleanP.includes(nl);
    });
    if (containsMatch) return containsMatch.id;
  }

  // 2. Semantic matching against non-root nodes
  const candidates = registeredNodes.filter((n) => n.id !== 'root');
  if (candidates.length === 0) return 'root';

  const contextText = `${rawParent || ''} ${label || ''}`.toLowerCase();
  let bestCandidate = candidates[0];
  let highestScore = -1;

  candidates.forEach((cand) => {
    let score = 0;
    const candLower = cand.label.toLowerCase();

    // Word tokens overlap
    const tokens = candLower.split(/\W+/).filter((w) => w.length > 2);
    tokens.forEach((tok) => {
      if (contextText.includes(tok)) score += 4;
    });

    // Domain keywords overlap
    Object.values(DOMAIN_KEYWORDS).forEach((keywords) => {
      const candInDomain = keywords.some((k) => candLower.includes(k));
      if (candInDomain) {
        keywords.forEach((kw) => {
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

/**
 * InterestTreeVis for mobile:
 * Computes an authentic hierarchical tree layout where every child is assigned
 * to its exact, verified parent node.
 */
export default function InterestTreeVis({
  userCategory = 'Explorer',
  initialInterests = [],
  aiTreePath = [],
}) {
  const treeData = useMemo(() => {
    const nodes = [];
    const edges = [];
    const nodesMap = {};
    const registeredNodes = [];
    const childrenMap = {};

    // Helper to register node
    const addNode = (node) => {
      nodes.push(node);
      nodesMap[node.id] = node;
      registeredNodes.push({ id: node.id, label: node.cleanLabel || node.label });
      childrenMap[node.id] = [];
    };

    // Helper to add edge
    const addEdge = (sourceId, targetId) => {
      edges.push({ source: sourceId, target: targetId });
      if (!childrenMap[sourceId]) childrenMap[sourceId] = [];
      childrenMap[sourceId].push(targetId);
    };

    // Level 0: Root node
    const rootNode = {
      id: 'root',
      label: `👤 ${userCategory || 'Explorer'}`,
      cleanLabel: userCategory || 'Explorer',
      bgColor: colors.noteYellow,
      level: 0,
      parentId: null,
    };
    addNode(rootNode);

    // Level 1: Initial Interests (children of root)
    const interests =
      initialInterests.length > 0 ? initialInterests : ['General Focus'];

    interests.forEach((interest, idx) => {
      const nodeId = `initial-${idx}`;
      const node = {
        id: nodeId,
        label: interest,
        cleanLabel: interest,
        bgColor: colors.noteBlue,
        level: 1,
        parentId: 'root',
      };
      addNode(node);
      addEdge('root', nodeId);
    });

    // Level 2+: Dynamic AI Nodes with authentic parent assignment
    aiTreePath.forEach((item, idx) => {
      const nodeId = `ai-${idx}`;
      const label =
        typeof item === 'string'
          ? item
          : item.label || item.treeNodeLabel || 'Specialization';
      const rawParent =
        typeof item === 'object' ? item.parent || item.parentNode : null;

      // Find the true parent ID
      const parentId = findParentNodeId(rawParent, label, registeredNodes);
      const parentNode = nodesMap[parentId] || rootNode;

      const childNode = {
        id: nodeId,
        label: `✨ ${label}`,
        cleanLabel: label,
        bgColor: PASTEL_COLORS[(idx + 2) % PASTEL_COLORS.length],
        level: parentNode.level + 1,
        parentId: parentId,
      };

      addNode(childNode);
      addEdge(parentId, nodeId);
    });

    // HIERARCHICAL REINGOLD-TILFORD / WALKER SUBTREE LAYOUT
    const H_GAP = 18;
    const subtreeWidths = {};

    // 1. Post-order traversal to calculate subtree width
    const computeSubtreeWidth = (nodeId) => {
      const children = childrenMap[nodeId] || [];
      if (children.length === 0) {
        subtreeWidths[nodeId] = NODE_WIDTH;
        return NODE_WIDTH;
      }
      let totalChildWidth = 0;
      children.forEach((childId, idx) => {
        const w = computeSubtreeWidth(childId);
        totalChildWidth += w;
        if (idx < children.length - 1) totalChildWidth += H_GAP;
      });
      subtreeWidths[nodeId] = Math.max(NODE_WIDTH, totalChildWidth);
      return subtreeWidths[nodeId];
    };

    const rootSubtreeWidth = computeSubtreeWidth('root');
    const canvasWidth = Math.max(SCREEN_WIDTH - 32, rootSubtreeWidth + 40);

    let maxLevel = 0;
    const positions = {};

    // 2. Pre-order traversal to position each parent directly centered above its children
    const assignPositions = (nodeId, leftX, level) => {
      if (level > maxLevel) maxLevel = level;
      const w = subtreeWidths[nodeId];
      const nodeX = leftX + (w - NODE_WIDTH) / 2;
      const nodeY = 20 + level * LEVEL_HEIGHT;

      positions[nodeId] = {
        x: nodeX,
        y: nodeY,
        cx: nodeX + NODE_WIDTH / 2,
        cy: nodeY + NODE_HEIGHT / 2,
      };

      const children = childrenMap[nodeId] || [];
      let currentChildLeft = leftX;
      children.forEach((childId) => {
        const childWidth = subtreeWidths[childId];
        assignPositions(childId, currentChildLeft, level + 1);
        currentChildLeft += childWidth + H_GAP;
      });
    };

    const rootLeftX = (canvasWidth - rootSubtreeWidth) / 2;
    assignPositions('root', rootLeftX, 0);

    const canvasHeight = (maxLevel + 1) * LEVEL_HEIGHT + 40;

    return {
      nodes,
      edges,
      positions,
      canvasWidth,
      canvasHeight,
    };
  }, [userCategory, initialInterests, aiTreePath]);

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="family-tree" size={18} color={colors.primary} />
          <Text style={styles.headerTitle}>YOUR EMERGING SKILL TREE</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {aiTreePath.length > 0
            ? `${aiTreePath.length} specialized branches mapped out`
            : 'Select goals to watch your tree branch broadly'}
        </Text>
      </View>

      {/* Interactive Horizontal Canvas */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollCanvas,
          { width: treeData.canvasWidth, height: treeData.canvasHeight },
        ]}
      >
        <View style={{ width: treeData.canvasWidth, height: treeData.canvasHeight }}>
          {/* SVG Connecting Edges */}
          <Svg
            width={treeData.canvasWidth}
            height={treeData.canvasHeight}
            style={StyleSheet.absoluteFillObject}
          >
            {treeData.edges.map((edge) => {
              const src = treeData.positions[edge.source];
              const tgt = treeData.positions[edge.target];
              if (!src || !tgt) return null;

              const x1 = src.cx;
              const y1 = src.y + NODE_HEIGHT;
              const x2 = tgt.cx;
              const y2 = tgt.y;

              const midY = (y1 + y2) / 2;
              const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

              return (
                <React.Fragment key={`${edge.source}-${edge.target}`}>
                  <Path
                    d={d}
                    stroke={colors.ink}
                    strokeWidth={2}
                    strokeDasharray="4,4"
                    fill="none"
                  />
                  <Circle cx={x2} cy={y2} r={3} fill={colors.primary} />
                </React.Fragment>
              );
            })}
          </Svg>

          {/* Node Cards */}
          {treeData.nodes.map((node) => {
            const pos = treeData.positions[node.id];
            if (!pos) return null;

            return (
              <View
                key={node.id}
                style={[
                  styles.nodeCard,
                  {
                    left: pos.x,
                    top: pos.y,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    backgroundColor: node.bgColor,
                  },
                ]}
              >
                <Text style={styles.nodeText} numberOfLines={2}>
                  {node.label}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.noteYellow,
    borderBottomWidth: 1.5,
    borderColor: colors.ink,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.inkMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  scrollCanvas: {
    padding: 10,
    backgroundColor: colors.bgPaper,
  },
  nodeCard: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  nodeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
});
