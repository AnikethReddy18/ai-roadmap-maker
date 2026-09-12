import React, { useState, useEffect } from 'react';
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

export default function RoadmapViewScreen({ route, navigation }) {
  const { roadmap: initialRoadmap } = route.params;
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [selectedNode, setSelectedNode] = useState(null);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [generatingSub, setGeneratingSub] = useState(false);

  useEffect(() => {
    if (route.params?.roadmap) {
      setRoadmap(route.params.roadmap);
    }
  }, [route.params?.roadmap]);

  const nodes = roadmap?.nodes || [];
  const completedCount = nodes.filter((n) => n.completed).length;
  const progressPercent = nodes.length > 0 ? Math.round((completedCount / nodes.length) * 100) : 0;
  const isFullyCompleted = progressPercent === 100 && nodes.length > 0;

  // Toggle node completion status
  const handleToggleNodeComplete = async (nodeId, currentStatus) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    const updatedNodes = nodes.map((n) => (n.id === nodeId ? { ...n, completed: newStatus } : n));
    setRoadmap({ ...roadmap, nodes: updatedNodes });

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, completed: newStatus });
    }

    try {
      if (roadmap._id) {
        await apiFetch(`/roadmaps/${roadmap._id}/complete`, {
          method: 'PUT',
          body: JSON.stringify({ nodeId, completed: newStatus }),
        });
      }
    } catch (error) {
      console.log('Failed to persist node status:', error);
    }
  };

  // Generate sub-roadmap for a specific topic node
  const handleGenerateSubRoadmap = async (node) => {
    setGeneratingSub(true);
    try {
      const subData = await apiFetch('/generate/sub', {
        method: 'POST',
        body: JSON.stringify({
          topic: node.title,
          parentTopic: roadmap.title,
        }),
      });

      if (subData && subData.nodes) {
        setSelectedNode(null);
        navigation.push('RoadmapView', { roadmap: subData });
      } else {
        Alert.alert('Sub-Roadmap Error', 'Could not generate sub-roadmap.');
      }
    } catch (error) {
      Alert.alert('Sub-Roadmap Failed', error.message || 'Server error while creating sub-roadmap.');
    } finally {
      setGeneratingSub(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgCanvas} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.sketchInk} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {roadmap.title}
          </Text>
          <Text style={styles.headerSub}>
            {completedCount} of {nodes.length} Topics Completed
          </Text>
        </View>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>{progressPercent}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cosmo Assistant Banner */}
        <AvatarGuide
          message={
            isFullyCompleted
              ? "Awesome job completing all topics! Take the 10-Question Evaluation Quiz to test your mastery."
              : `Tap any topic node below to view study resources, track progress, or expand deeper sub-roadmaps.`
          }
          mood={isFullyCompleted ? 'happy' : 'normal'}
        />

        {/* 100% Completion Card if applicable */}
        {isFullyCompleted && (
          <TouchableOpacity
            style={styles.quizTriggerCard}
            onPress={() => setQuizModalVisible(true)}
          >
            <MaterialCommunityIcons name="trophy-award" size={32} color={colors.sketchInk} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.quizTriggerTitle}>Course 100% Complete!</Text>
              <Text style={styles.quizTriggerSub}>Take the 10-Question Evaluation Test now →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Vertical Nodes List */}
        <View style={styles.timelineContainer}>
          {nodes.map((node, index) => {
            const isCompleted = !!node.completed;
            const isLast = index === nodes.length - 1;

            return (
              <View key={node.id || `node-${index}`} style={styles.timelineItem}>
                {/* Connecting vertical line */}
                {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineDone]} />}

                {/* Node Status Marker */}
                <TouchableOpacity
                  style={[
                    styles.nodeMarker,
                    isCompleted && styles.nodeMarkerDone,
                  ]}
                  onPress={() => setSelectedNode(node)}
                >
                  <MaterialCommunityIcons
                    name={isCompleted ? 'check-bold' : 'pencil-outline'}
                    size={16}
                    color={isCompleted ? colors.sketchInk : colors.sketchSubtle}
                  />
                </TouchableOpacity>

                {/* Node Card Content */}
                <TouchableOpacity
                  style={[
                    styles.nodeCard,
                    isCompleted && styles.nodeCardDone,
                  ]}
                  onPress={() => setSelectedNode(node)}
                >
                  <View style={styles.nodeHeaderRow}>
                    <Text style={styles.nodeStepLabel}>STEP {index + 1}</Text>
                    {node.estimatedHours && (
                      <View style={styles.timeTag}>
                        <MaterialCommunityIcons name="clock-outline" size={12} color={colors.sketchInk} />
                        <Text style={styles.timeTagText}>{node.estimatedHours} hrs</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.nodeTitle}>{node.title}</Text>
                  <Text style={styles.nodeDesc} numberOfLines={2}>
                    {node.description}
                  </Text>

                  {/* Resource summary tag */}
                  {node.resources && node.resources.length > 0 && (
                    <View style={styles.resourceCountTag}>
                      <MaterialCommunityIcons name="book-open-variant" size={12} color={colors.brandDark} />
                      <Text style={styles.resourceCountText}>
                        {node.resources.length} Embedded Study Resources
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Bottom Evaluation Quiz Button */}
        <TouchableOpacity
          style={styles.bottomQuizBtn}
          onPress={() => setQuizModalVisible(true)}
        >
          <MaterialCommunityIcons name="file-document-edit-outline" size={20} color={colors.sketchInk} />
          <Text style={styles.bottomQuizBtnText}>Take 10-Question Evaluation Quiz</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Node Detail Sheet Modal */}
      {selectedNode && (
        <NodeDetailSheet
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onToggleComplete={(nodeId, currentStatus) => handleToggleNodeComplete(nodeId, currentStatus)}
          onGenerateSub={(node) => handleGenerateSubRoadmap(node)}
          loadingSub={generatingSub}
        />
      )}

      {/* 10-Question Evaluation Quiz Modal */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bgCanvas,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.sketchInk,
  },
  headerSub: {
    fontSize: 12,
    color: colors.sketchSubtle,
    fontWeight: '600',
  },
  badgeWrap: {
    backgroundColor: colors.mintBadgeBg,
    borderWidth: 1.5,
    borderColor: colors.sketchInk,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.mintBadgeText,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.sketchTrack,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandMint,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  quizTriggerCard: {
    backgroundColor: colors.yellowBadgeBg,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quizTriggerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.sketchInk,
  },
  quizTriggerSub: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandDark,
    marginTop: 2,
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 36,
    bottom: -24,
    width: 2,
    backgroundColor: colors.sketchTrack,
    zIndex: 0,
  },
  timelineLineDone: {
    backgroundColor: colors.brandMint,
  },
  nodeMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginRight: 12,
  },
  nodeMarkerDone: {
    backgroundColor: colors.mintBadgeBg,
  },
  nodeCard: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 16,
    padding: 14,
  },
  nodeCardDone: {
    backgroundColor: '#f8fafc',
    borderColor: colors.brandMint,
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
    color: colors.sketchSubtle,
    letterSpacing: 0.8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCanvas,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.sketchInk,
  },
  nodeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.sketchInk,
    marginBottom: 4,
  },
  nodeDesc: {
    fontSize: 12,
    color: colors.sketchSubtle,
    lineHeight: 18,
  },
  resourceCountTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: colors.mintBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  resourceCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brandDark,
  },
  bottomQuizBtn: {
    backgroundColor: colors.yellowBadgeBg,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  bottomQuizBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.sketchInk,
  },
});
