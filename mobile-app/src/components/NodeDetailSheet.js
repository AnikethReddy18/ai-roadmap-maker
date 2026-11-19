import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import SketchBadge from './SketchBadge';

export default function NodeDetailSheet({
  node,
  completed,
  onClose,
  onToggleCompleted,
  onToggleComplete,
  onGenerateSubRoadmap,
  onGenerateSub,
  loadingSub = false,
}) {
  if (!node) return null;

  const handleToggle = () => {
    const fn = onToggleCompleted || onToggleComplete;
    if (typeof fn === 'function') {
      fn(node.id || node._id, completed);
    }
  };

  const handleGenerateSub = () => {
    const fn = onGenerateSubRoadmap || onGenerateSub;
    if (typeof fn === 'function') {
      fn(node);
    }
  };

  const displayResources = node.resources || [];

  const handleOpenLink = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Couldn't open URL:", err)
      );
    }
  };

  const getResourceMeta = (type = '', platform = '') => {
    const t = (type + ' ' + platform).toLowerCase();
    if (t.includes('video') || t.includes('youtube')) {
      return {
        icon: 'play-circle-outline',
        color: colors.error,
        bg: colors.noteRose,
        label: 'Video',
      };
    }
    if (t.includes('doc') || t.includes('official') || t.includes('mdn') || t.includes('api')) {
      return {
        icon: 'file-document-outline',
        color: colors.primary,
        bg: colors.noteBlue,
        label: 'Docs',
      };
    }
    if (t.includes('tutorial') || t.includes('course') || t.includes('guide')) {
      return {
        icon: 'school-outline',
        color: colors.success,
        bg: colors.noteGreen,
        label: 'Tutorial',
      };
    }
    if (t.includes('interactive') || t.includes('playground') || t.includes('github') || t.includes('code')) {
      return {
        icon: 'code-tags',
        color: colors.accentPurple,
        bg: colors.notePurple,
        label: 'Interactive',
      };
    }
    return {
      icon: 'bookmark-outline',
      color: colors.warning,
      bg: colors.noteYellow,
      label: 'Article',
    };
  };

  return (
    <Modal
      visible={!!node}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop tap closes */}
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Top grab bar */}
          <View style={styles.grabBarWrap}>
            <View style={styles.grabBar} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.sheetBadgeLabel}>TOPIC STUDY SHEET</Text>
              <Text style={styles.title}>{node.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Description */}
            <Text style={styles.description}>{node.description}</Text>

            {/* Meta Row */}
            <View style={styles.metaRow}>
              <SketchBadge
                label={node.estimatedTime || node.estimatedHours ? `${node.estimatedTime || node.estimatedHours + ' hrs'}` : '1-2 hrs'}
                bgColor={colors.noteBlue}
                textColor={colors.primaryDark}
                icon={
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={colors.primaryDark}
                  />
                }
              />

              <SketchBadge
                label={completed ? 'Completed ✨' : 'In Progress'}
                bgColor={completed ? colors.noteGreen : colors.noteYellow}
                textColor={completed ? colors.mintBadgeText : colors.yellowBadgeText}
                icon={
                  <MaterialCommunityIcons
                    name={completed ? 'check-circle' : 'circle-outline'}
                    size={14}
                    color={completed ? colors.mintBadgeText : colors.yellowBadgeText}
                  />
                }
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: completed ? colors.noteRose : colors.noteGreen,
                  },
                ]}
                onPress={handleToggle}
              >
                <MaterialCommunityIcons
                  name={completed ? 'undo-variant' : 'check-bold'}
                  size={18}
                  color={colors.ink}
                />
                <Text style={styles.actionButtonText}>
                  {completed ? 'Mark Incomplete' : 'Mark Completed'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.actionButton, styles.subRoadmapBtn]}
                onPress={handleGenerateSub}
                disabled={loadingSub}
              >
                {loadingSub ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="auto-fix"
                      size={18}
                      color={colors.white}
                    />
                    <Text style={[styles.actionButtonText, { color: colors.white }]}>
                      Sub-Roadmap
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Embedded Study Resources Section */}
            <View style={styles.resourcesSection}>
              <View style={styles.resourcesHeaderRow}>
                <MaterialCommunityIcons
                  name="book-open-page-variant-outline"
                  size={20}
                  color={colors.ink}
                />
                <Text style={styles.sectionTitle}>Curated Study Materials</Text>
              </View>

              {displayResources.length === 0 ? (
                <View style={styles.emptyResourceBox}>
                  <Text style={styles.emptyText}>
                    No embedded links available for this step yet.
                  </Text>
                </View>
              ) : (
                displayResources.map((res, idx) => {
                  const meta = getResourceMeta(res.type, res.platform);
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.75}
                      style={styles.resourceCard}
                      onPress={() => handleOpenLink(res.url)}
                    >
                      <View style={[styles.resourceIconWrap, { backgroundColor: meta.bg }]}>
                        <MaterialCommunityIcons
                          name={meta.icon}
                          size={20}
                          color={meta.color}
                        />
                      </View>

                      <View style={styles.resourceInfo}>
                        <Text style={styles.resourceTitle} numberOfLines={2}>
                          {res.title || 'Official Learning Reference'}
                        </Text>
                        <Text style={styles.resourcePlatform}>
                          {res.platform || meta.label} • {res.type || 'Guide'}
                        </Text>
                      </View>

                      <View style={styles.openIconWrap}>
                        <MaterialCommunityIcons
                          name="open-in-new"
                          size={18}
                          color={colors.primary}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.bgPaper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.ink,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  grabBarWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  grabBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.inkMuted,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.sketchTrack,
    marginBottom: 12,
  },
  sheetBadgeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.inkMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 24,
  },
  closeBtn: {
    width: 36,
    height: 36,
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
  content: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  description: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    gap: 6,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  subRoadmapBtn: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.ink,
  },
  resourcesSection: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  resourcesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  emptyResourceBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPaper,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  resourceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  resourcePlatform: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  openIconWrap: {
    marginLeft: 8,
    padding: 4,
  },
});
