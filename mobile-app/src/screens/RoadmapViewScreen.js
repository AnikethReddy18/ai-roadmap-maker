import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiFetch } from '../config/api';
import NodeDetailSheet from '../components/NodeDetailSheet';
import EvaluationQuizModal from '../components/EvaluationQuizModal';
import AvatarGuide from '../components/AvatarGuide';
import NotebookBackground from '../components/NotebookBackground';

const PASTEL_ROTATION = [
  colors.noteYellow,
  colors.noteBlue,
  colors.notePurple,
  colors.noteOrange,
  colors.noteRose,
];

const getNodeId = (n) => (n ? (n.id || n._id || '') : '');

export default function RoadmapViewScreen({ route, navigation }) {
  const { roadmap: initialRoadmap } = route.params;
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [selectedNode, setSelectedNode] = useState(null);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [generatingSub, setGeneratingSub] = useState(false);
  const [subroadmapsMap, setSubroadmapsMap] = useState({});

  useEffect(() => {
    if (route.params?.roadmap) {
      setRoadmap(route.params.roadmap);
    }
  }, [route.params?.roadmap]);

  // Load existing saved sub-roadmaps for this user once
  const loadSubRoadmaps = useCallback(async () => {
    try {
      const allRoadmaps = await apiFetch('/api/roadmaps');
      if (Array.isArray(allRoadmaps)) {
        const map = {};
        allRoadmaps.forEach((r) => {
          if (r.isSubRoadmap) {
            if (r.parentNodeId) map[r.parentNodeId] = r;
            if (r.title) {
              const lower = r.title.toLowerCase();
              map[lower] = r;
              const clean = lower.replace(/ deep dive$/i, '').trim();
              map[clean] = r;
            }
          }
        });
        setSubroadmapsMap(map);
      }
    } catch (e) {
      console.log('Error loading saved subroadmaps:', e.message);
    }
  }, []);

  useEffect(() => {
    loadSubRoadmaps();
  }, [loadSubRoadmaps]);

  // Normalize completedNodes map
  const completedMap = useMemo(() => {
    const map = {};
    if (roadmap?.completedNodes) {
      if (roadmap.completedNodes instanceof Map) {
        roadmap.completedNodes.forEach((val, key) => {
          map[key] = !!val;
        });
      } else if (typeof roadmap.completedNodes === 'object') {
        Object.entries(roadmap.completedNodes).forEach(([key, val]) => {
          map[key] = !!val;
        });
      }
    }
    // Also check completed property directly on nodes ONLY if not explicitly set in map
    const checkNodes = (nodesList = []) => {
      nodesList.forEach((n) => {
        if (!n) return;
        const id = getNodeId(n);
        if (id && map[id] === undefined && n.completed) {
          map[id] = true;
        }
      });
    };
    if (Array.isArray(roadmap?.nodes)) checkNodes(roadmap.nodes);
    if (Array.isArray(roadmap?.phases)) {
      roadmap.phases.forEach((p) => checkNodes(p.nodes));
    }
    return map;
  }, [roadmap]);

  // Extract flat list of nodes for overall progress metrics
  const allNodes = useMemo(() => {
    if (!roadmap) return [];
    if (Array.isArray(roadmap.phases) && roadmap.phases.length > 0) {
      return roadmap.phases.flatMap((phase) => phase.nodes || []);
    }
    if (Array.isArray(roadmap.nodes)) return roadmap.nodes;
    return [];
  }, [roadmap]);

  const totalCount = allNodes.length;
  const completedCount = allNodes.filter((n) => {
    const id = getNodeId(n);
    return !!completedMap[id];
  }).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isFullyCompleted = progressPercent === 100 && totalCount > 0;

  // Toggle node completion status
  const handleToggleNodeComplete = async (nodeId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic UI update
    const newCompletedMap = {
      ...completedMap,
      [nodeId]: newStatus,
    };

    setRoadmap((prev) => {
      const updateNode = (n) => {
        const id = getNodeId(n);
        return id === nodeId ? { ...n, completed: newStatus } : n;
      };

      const updatedPhases = Array.isArray(prev.phases)
        ? prev.phases.map((phase) => ({
            ...phase,
            nodes: Array.isArray(phase.nodes) ? phase.nodes.map(updateNode) : [],
          }))
        : prev.phases;

      const updatedNodes = Array.isArray(prev.nodes)
        ? prev.nodes.map(updateNode)
        : updatedPhases
        ? updatedPhases.flatMap((p) => p.nodes || [])
        : [];

      return {
        ...prev,
        completedNodes: newCompletedMap,
        nodes: updatedNodes,
        phases: updatedPhases,
      };
    });

    if (selectedNode) {
      const selId = getNodeId(selectedNode);
      if (selId === nodeId) {
        setSelectedNode((prev) => (prev ? { ...prev, completed: newStatus } : null));
      }
    }

    try {
      if (roadmap._id) {
        const updated = await apiFetch(`/api/roadmaps/${roadmap._id}/complete`, {
          method: 'PUT',
          body: JSON.stringify({ nodeId, completed: newStatus }),
        });
        if (updated && updated.completedNodes) {
          const syncedMap = {};
          if (updated.completedNodes instanceof Map) {
            updated.completedNodes.forEach((v, k) => {
              syncedMap[k] = !!v;
            });
          } else if (typeof updated.completedNodes === 'object') {
            Object.entries(updated.completedNodes).forEach(([k, v]) => {
              syncedMap[k] = !!v;
            });
          }
          setRoadmap((prev) => ({
            ...prev,
            completedNodes: { ...newCompletedMap, ...syncedMap },
          }));
        }
      }
    } catch (error) {
      console.log('Failed to persist node status:', error);
    }
  };

  const handleOpenSubRoadmap = (existingSub) => {
    setSelectedNode(null);
    navigation.push('RoadmapView', {
      roadmap: {
        ...existingSub,
        nodes:
          Array.isArray(existingSub.nodes) && existingSub.nodes.length > 0
            ? existingSub.nodes
            : existingSub.phases
            ? existingSub.phases.flatMap((p) => p.nodes || [])
            : [],
      },
    });
  };

  const handleGenerateSubRoadmap = async (node) => {
    const nId = getNodeId(node);
    const existingSub = subroadmapsMap[nId] || subroadmapsMap[node.title?.toLowerCase()];
    if (existingSub) {
      handleOpenSubRoadmap(existingSub);
      return;
    }

    setGeneratingSub(true);
    try {
      const subData = await apiFetch('/api/generate/sub', {
        method: 'POST',
        body: JSON.stringify({
          subTopic: node.title,
          parentTopic: roadmap.title,
          nodeId: nId || 'sub-1',
        }),
      });

      if (subData && (Array.isArray(subData.phases) || Array.isArray(subData.nodes))) {
        let savedSub = null;
        try {
          savedSub = await apiFetch('/api/roadmaps', {
            method: 'POST',
            body: JSON.stringify({
              title: subData.title || `${node.title} Deep Dive`,
              description: subData.description || '',
              phases:
                subData.phases || [
                  { id: 'phase-1', title: 'Deep Dive', nodes: subData.nodes || [] },
                ],
              isSubRoadmap: true,
              parentNodeId: nId || '',
            }),
          });
        } catch (saveErr) {
          console.log('Auto-save generated sub-roadmap:', saveErr.message);
        }

        const finalRoadmap = savedSub || {
          ...subData,
          nodes:
            subData.nodes ||
            (subData.phases ? subData.phases.flatMap((p) => p.nodes || []) : []),
        };

        // Cache immediately so this node is never re-generated
        setSubroadmapsMap((prev) => ({
          ...prev,
          [nId]: finalRoadmap,
          [node.title?.toLowerCase()]: finalRoadmap,
          [(finalRoadmap.title || '').toLowerCase()]: finalRoadmap,
        }));

        setSelectedNode(null);
        navigation.push('RoadmapView', {
          roadmap: {
            ...finalRoadmap,
            nodes:
              Array.isArray(finalRoadmap.nodes) && finalRoadmap.nodes.length > 0
                ? finalRoadmap.nodes
                : finalRoadmap.phases
                ? finalRoadmap.phases.flatMap((p) => p.nodes || [])
                : [],
          },
        });
      } else {
        Alert.alert('Sub-Roadmap Error', 'Could not generate sub-roadmap.');
      }
    } catch (error) {
      Alert.alert('Sub-Roadmap Failed', error.message || 'Server error while creating sub-roadmap.');
    } finally {
      setGeneratingSub(false);
    }
  };

  let globalNodeCounter = 0;

  return (
    <NotebookBackground showMargin={true}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgPaper} />
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={colors.ink} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerSubtitle}>
              {roadmap.isSubRoadmap ? 'SUB-ROADMAP DEEP DIVE' : 'LEARNING PATH'}
            </Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {roadmap.title}
            </Text>
          </View>

          <View
            style={[
              styles.progressPill,
              {
                backgroundColor:
                  progressPercent === 100 ? colors.noteGreen : colors.noteYellow,
              },
            ]}
          >
            <Text style={styles.progressPillText}>{progressPercent}%</Text>
          </View>
        </View>

        {/* Sketchy Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressMetaText}>
              {completedCount} of {totalCount} topics mastered
            </Text>
            <Text style={styles.progressRatioText}>
              {progressPercent === 100 ? 'All Completed! 🏆' : `${totalCount - completedCount} remaining`}
            </Text>
          </View>
          <View style={styles.progressBarOuter}>
            <View
              style={[
                styles.progressBarInner,
                {
                  width: `${progressPercent}%`,
                  backgroundColor:
                    progressPercent === 100 ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cosmo Assistant Banner */}
          <AvatarGuide
            message={
              isFullyCompleted
                ? "Incredible job mastering every topic on this path! Test your knowledge with the 10-Question Evaluation Quiz! 🏆"
                : progressPercent > 0
                ? `You're making great headway (${completedCount}/${totalCount})! Tap any topic card to review study guides.`
                : "Welcome to your customized path! Tap Step 1 below to open study materials and begin."
            }
            mood={isFullyCompleted ? 'excited' : progressPercent > 0 ? 'happy' : 'default'}
          />

          {/* 100% Mastered Celebratory Card */}
          {isFullyCompleted && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.congratsCard}
              onPress={() => setQuizModalVisible(true)}
            >
              <View style={styles.trophyCircle}>
                <MaterialCommunityIcons name="trophy-award" size={32} color={colors.yellowBadgeText} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.congratsTitle}>Path 100% Completed!</Text>
                <Text style={styles.congratsSubtitle}>
                  Take the 10-Question Evaluation Quiz to test your retention →
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Render Roadmap Phases if present */}
          {Array.isArray(roadmap.phases) && roadmap.phases.length > 0 ? (
            roadmap.phases.map((phase, pIdx) => (
              <View key={phase.id || `phase-${pIdx}`} style={styles.phaseSection}>
                {/* Phase Header Capsule */}
                <View style={styles.phaseHeaderCapsule}>
                  <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeTitle}>
                      {phase.title || `Phase ${pIdx + 1}`}
                    </Text>
                    {phase.description ? (
                      <Text style={styles.phaseBadgeDesc}>{phase.description}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Nodes inside Phase */}
                <View style={styles.nodesWrapper}>
                  {(phase.nodes || []).map((node, nIdx) => {
                    const nId = getNodeId(node);
                    const isDone = !!completedMap[nId];
                    const hasSub = !!(subroadmapsMap[nId] || subroadmapsMap[node.title?.toLowerCase()]);
                    const rotation = ((globalNodeCounter * 7) % 3) - 1.2;
                    const cardBg = isDone
                      ? colors.noteGreen
                      : PASTEL_ROTATION[globalNodeCounter % PASTEL_ROTATION.length];
                    globalNodeCounter += 1;

                    return (
                      <View key={nId || `node-${nIdx}`} style={styles.nodeItem}>
                        {/* Connecting vertical line */}
                        {nIdx < (phase.nodes?.length || 0) - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              isDone && styles.timelineLineDone,
                            ]}
                          />
                        )}

                        {/* Node status toggle marker */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={[
                            styles.nodeMarker,
                            isDone && styles.nodeMarkerDone,
                          ]}
                          onPress={() => handleToggleNodeComplete(nId, isDone)}
                        >
                          <MaterialCommunityIcons
                            name={isDone ? 'check-bold' : 'circle-outline'}
                            size={16}
                            color={isDone ? colors.mintBadgeText : colors.inkMuted}
                          />
                        </TouchableOpacity>

                        {/* Interactive Node Card */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[
                            styles.nodeCard,
                            {
                              backgroundColor: cardBg,
                              transform: [{ rotate: `${rotation}deg` }],
                            },
                          ]}
                          onPress={() =>
                            setSelectedNode({ ...node, id: nId, completed: isDone })
                          }
                        >
                          <View style={styles.nodeHeaderRow}>
                            <Text style={styles.nodeStepLabel}>
                              STEP {globalNodeCounter}
                            </Text>

                            {(node.estimatedTime || node.estimatedHours) && (
                              <View style={styles.timeTag}>
                                <MaterialCommunityIcons
                                  name="clock-outline"
                                  size={12}
                                  color={colors.ink}
                                />
                                <Text style={styles.timeTagText}>
                                  {node.estimatedTime || `${node.estimatedHours} hrs`}
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.nodeTitle}>{node.title}</Text>
                          {node.description ? (
                            <Text style={styles.nodeDesc} numberOfLines={2}>
                              {node.description}
                            </Text>
                          ) : null}

                          <View style={styles.nodeFooterRow}>
                            {node.resources && node.resources.length > 0 ? (
                              <View style={styles.resourceTag}>
                                <MaterialCommunityIcons
                                  name="book-open-outline"
                                  size={12}
                                  color={colors.ink}
                                />
                                <Text style={styles.resourceTagText}>
                                  {node.resources.length} Guides
                                </Text>
                              </View>
                            ) : null}

                            {hasSub && (
                              <View style={styles.subSavedTag}>
                                <MaterialCommunityIcons
                                  name="source-branch"
                                  size={12}
                                  color={colors.accentPurple}
                                />
                                <Text style={styles.subSavedTagText}>Sub-Path Ready</Text>
                              </View>
                            )}

                            <View style={styles.openDetailHint}>
                              <Text style={styles.openDetailText}>Details</Text>
                              <MaterialCommunityIcons
                                name="chevron-right"
                                size={14}
                                color={colors.ink}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          ) : (
            /* Flat Nodes List */
            <View style={styles.nodesWrapper}>
              {allNodes.map((node, idx) => {
                const nId = getNodeId(node);
                const isDone = !!completedMap[nId];
                const hasSub = !!(subroadmapsMap[nId] || subroadmapsMap[node.title?.toLowerCase()]);
                const rotation = ((idx * 7) % 3) - 1.2;
                const cardBg = isDone
                  ? colors.noteGreen
                  : PASTEL_ROTATION[idx % PASTEL_ROTATION.length];

                return (
                  <View key={nId || `node-${idx}`} style={styles.nodeItem}>
                    {idx < allNodes.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isDone && styles.timelineLineDone,
                        ]}
                      />
                    )}

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        styles.nodeMarker,
                        isDone && styles.nodeMarkerDone,
                      ]}
                      onPress={() => handleToggleNodeComplete(nId, isDone)}
                    >
                      <MaterialCommunityIcons
                        name={isDone ? 'check-bold' : 'circle-outline'}
                        size={16}
                        color={isDone ? colors.mintBadgeText : colors.inkMuted}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.nodeCard,
                        {
                          backgroundColor: cardBg,
                          transform: [{ rotate: `${rotation}deg` }],
                        },
                      ]}
                      onPress={() =>
                        setSelectedNode({ ...node, id: nId, completed: isDone })
                      }
                    >
                      <View style={styles.nodeHeaderRow}>
                        <Text style={styles.nodeStepLabel}>STEP {idx + 1}</Text>
                        {(node.estimatedTime || node.estimatedHours) && (
                          <View style={styles.timeTag}>
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={12}
                              color={colors.ink}
                            />
                            <Text style={styles.timeTagText}>
                              {node.estimatedTime || `${node.estimatedHours} hrs`}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.nodeTitle}>{node.title}</Text>
                      {node.description ? (
                        <Text style={styles.nodeDesc} numberOfLines={2}>
                          {node.description}
                        </Text>
                      ) : null}

                      <View style={styles.nodeFooterRow}>
                        {node.resources && node.resources.length > 0 ? (
                          <View style={styles.resourceTag}>
                            <MaterialCommunityIcons
                              name="book-open-outline"
                              size={12}
                              color={colors.ink}
                            />
                            <Text style={styles.resourceTagText}>
                              {node.resources.length} Guides
                            </Text>
                          </View>
                        ) : null}

                        {hasSub && (
                          <View style={styles.subSavedTag}>
                            <MaterialCommunityIcons
                              name="source-branch"
                              size={12}
                              color={colors.accentPurple}
                            />
                            <Text style={styles.subSavedTagText}>Sub-Path Ready</Text>
                          </View>
                        )}

                        <View style={styles.openDetailHint}>
                          <Text style={styles.openDetailText}>Details</Text>
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={14}
                            color={colors.ink}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Bottom Action: Take Evaluation Quiz */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bottomQuizBtn}
            onPress={() => setQuizModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={20}
              color={colors.ink}
            />
            <Text style={styles.bottomQuizBtnText}>
              Take 10-Question Evaluation Quiz
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Node Detail Sheet Modal */}
        {selectedNode && (
          <NodeDetailSheet
            node={selectedNode}
            completed={!!completedMap[getNodeId(selectedNode)]}
            onClose={() => setSelectedNode(null)}
            onToggleCompleted={(nodeId, currentStatus) =>
              handleToggleNodeComplete(nodeId, currentStatus)
            }
            existingSubRoadmap={
              subroadmapsMap[getNodeId(selectedNode)] ||
              subroadmapsMap[selectedNode?.title?.toLowerCase()]
            }
            onOpenSubRoadmap={handleOpenSubRoadmap}
            onGenerateSubRoadmap={(node) => handleGenerateSubRoadmap(node)}
            loadingSub={generatingSub}
          />
        )}

        {/* Evaluation Quiz Modal */}
        {quizModalVisible && (
          <EvaluationQuizModal
            visible={quizModalVisible}
            onClose={() => setQuizModalVisible(false)}
            roadmapId={roadmap._id}
            roadmapTitle={roadmap.title}
            navigation={navigation}
          />
        )}
      </SafeAreaView>
    </NotebookBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.bgPaper,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.inkMuted,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  progressPill: {
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  progressPillText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.ink,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bgPaperWarm,
    borderBottomWidth: 1.5,
    borderColor: colors.sketchTrack,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressMetaText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  progressRatioText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  progressBarOuter: {
    height: 10,
    backgroundColor: colors.bgPaper,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  congratsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  trophyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  congratsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  congratsSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
    marginTop: 2,
  },
  phaseSection: {
    marginBottom: 20,
  },
  phaseHeaderCapsule: {
    alignItems: 'center',
    marginVertical: 10,
  },
  phaseBadge: {
    backgroundColor: colors.bgPaperWarm,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    alignItems: 'center',
  },
  phaseBadgeTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  phaseBadgeDesc: {
    fontSize: 10,
    color: colors.inkMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  nodesWrapper: {
    marginTop: 4,
  },
  nodeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 36,
    bottom: -18,
    width: 2,
    backgroundColor: colors.ink,
    borderStyle: 'dashed',
    zIndex: 0,
  },
  timelineLineDone: {
    backgroundColor: colors.success,
  },
  nodeMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginRight: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  nodeMarkerDone: {
    backgroundColor: colors.noteGreen,
  },
  nodeCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 13,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nodeStepLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.inkMuted,
    letterSpacing: 1,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPaper,
    borderWidth: 1,
    borderColor: colors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  timeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.ink,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 4,
  },
  nodeDesc: {
    fontSize: 12,
    color: colors.ink,
    lineHeight: 17,
    opacity: 0.85,
  },
  nodeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  resourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPaper,
    borderWidth: 1,
    borderColor: colors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  resourceTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.ink,
  },
  subSavedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.notePurple,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  subSavedTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.accentPurple,
  },
  openDetailHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  openDetailText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
    marginRight: 2,
  },
  bottomQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    gap: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  bottomQuizBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
  },
});
