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

/**
 * InterestTreeVis for mobile:
 * Computes a broad, multi-child hierarchical tree layout.
 * Each parent node can host multiple children, fanning out broadly horizontally.
 */
export default function InterestTreeVis({
  userCategory = 'Explorer',
  initialInterests = [],
  aiTreePath = [],
}) {
  const treeData = useMemo(() => {
    const nodes = [];
    const edges = [];

    // Level 0: Root node
    const rootNode = {
      id: 'root',
      label: `👤 ${userCategory || 'Explorer'}`,
      bgColor: colors.noteYellow,
      level: 0,
      children: [],
    };
    nodes.push(rootNode);

    // Level 1: Initial Interests (multiple children from root)
    const level1Nodes = [];
    const interests = initialInterests.length > 0 ? initialInterests : ['General Focus'];

    interests.forEach((interest, idx) => {
      const node = {
        id: `initial-${idx}`,
        label: interest,
        bgColor: colors.noteBlue,
        level: 1,
        parentId: 'root',
        children: [],
      };
      nodes.push(node);
      level1Nodes.push(node);
      edges.push({ source: 'root', target: node.id });
    });

    // Level 2+: Dynamic AI Nodes with broad multi-child distribution
    const availableParents = [...level1Nodes];
    const MAX_CHILDREN_PER_NODE = 2;
    const parentChildrenCount = {};
    availableParents.forEach((p) => {
      parentChildrenCount[p.id] = 0;
    });

    aiTreePath.forEach((item, idx) => {
      const nodeId = `ai-${idx}`;

      // Pick parent with lowest children count to distribute broadly
      let parent = availableParents[0];
      for (const candidate of availableParents) {
        if ((parentChildrenCount[candidate.id] || 0) < (parentChildrenCount[parent.id] || 0)) {
          parent = candidate;
        }
      }

      parentChildrenCount[parent.id] = (parentChildrenCount[parent.id] || 0) + 1;

      // When parent reaches capacity, cycle it out if other candidates remain
      if (parentChildrenCount[parent.id] >= MAX_CHILDREN_PER_NODE) {
        const pIdx = availableParents.indexOf(parent);
        if (pIdx !== -1 && availableParents.length > 1) {
          availableParents.splice(pIdx, 1);
        }
      }

      const childNode = {
        id: nodeId,
        label: `✨ ${item}`,
        bgColor: PASTEL_COLORS[(idx + 2) % PASTEL_COLORS.length],
        level: parent.level + 1,
        parentId: parent.id,
        children: [],
      };

      nodes.push(childNode);
      edges.push({ source: parent.id, target: nodeId });

      availableParents.push(childNode);
      parentChildrenCount[nodeId] = 0;
    });

    // Group nodes by levels
    const levelsMap = {};
    nodes.forEach((n) => {
      if (!levelsMap[n.level]) levelsMap[n.level] = [];
      levelsMap[n.level].push(n);
    });

    const maxLevel = Math.max(...Object.keys(levelsMap).map(Number), 0);
    const maxNodesInAnyLevel = Math.max(
      ...Object.values(levelsMap).map((arr) => arr.length),
      1
    );

    const canvasWidth = Math.max(
      SCREEN_WIDTH - 32,
      maxNodesInAnyLevel * (NODE_WIDTH + 20) + 40
    );
    const canvasHeight = (maxLevel + 1) * LEVEL_HEIGHT + 30;

    // Calculate (x, y) coordinates for each node
    const positions = {};
    Object.keys(levelsMap).forEach((lvlStr) => {
      const lvl = Number(lvlStr);
      const row = levelsMap[lvl];
      const count = row.length;
      const stepX = canvasWidth / (count + 1);
      const y = 20 + lvl * LEVEL_HEIGHT;

      row.forEach((n, idx) => {
        const x = stepX * (idx + 1) - NODE_WIDTH / 2;
        positions[n.id] = { x, y, cx: x + NODE_WIDTH / 2, cy: y + NODE_HEIGHT / 2 };
      });
    });

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
