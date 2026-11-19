import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiFetch, removeAuthToken } from '../config/api';
import AvatarGuide from '../components/AvatarGuide';
import NotebookBackground from '../components/NotebookBackground';
import SketchBadge from '../components/SketchBadge';

const PRESET_DOMAINS = [
  {
    id: '1',
    title: 'Frontend Engineering',
    desc: 'React 19, TypeScript, Modern CSS & Web Architecture',
    icon: 'laptop',
    topic: 'Full Stack Frontend Engineering with React & Modern Web Standards',
    bgColor: colors.noteBlue,
  },
  {
    id: '2',
    title: 'Backend Systems',
    desc: 'Node.js, Express, Microservices & PostgreSQL',
    icon: 'server-network',
    topic: 'Node.js, Express, Microservices & Database Architecture',
    bgColor: colors.noteGreen,
  },
  {
    id: '3',
    title: 'AI & Machine Learning',
    desc: 'Python, PyTorch, LLMs & Deep Learning',
    icon: 'brain',
    topic: 'Machine Learning, Deep Learning, Python & PyTorch Roadmap',
    bgColor: colors.notePurple,
  },
  {
    id: '4',
    title: 'Cybersecurity',
    desc: 'Ethical Hacking, OWASP Top 10 & Incident Response',
    icon: 'shield-lock-outline',
    topic: 'Ethical Hacking, Network Security & Incident Response',
    bgColor: colors.noteOrange,
  },
  {
    id: '5',
    title: 'Cloud & DevOps',
    desc: 'Docker, Kubernetes, AWS & CI/CD Pipelines',
    icon: 'cloud-tags',
    topic: 'Docker, Kubernetes, AWS & CI/CD Pipelines',
    bgColor: colors.noteYellow,
  },
  {
    id: '6',
    title: 'Data Science & Analytics',
    desc: 'Pandas, Statistical Analysis & Visualization',
    icon: 'chart-bell-curve-cumulative',
    topic: 'Data Analysis, Pandas, Statistics & Data Visualization',
    bgColor: colors.noteRose,
  },
];

const QUICK_TOPICS = [
  '⚡ React 19 & Next.js',
  '🦀 Rust Systems',
  '🤖 PyTorch ML',
  '🔒 Ethical Hacking',
  '☁️ DevOps & AWS',
  '📊 Data Science',
];

export default function HomeScreen({ navigation, user, setUser }) {
  const [topicInput, setTopicInput] = useState('');
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSavedRoadmaps();
  }, []);

  const fetchSavedRoadmaps = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/roadmaps');
      if (Array.isArray(data)) {
        setRoadmaps(data);
      }
    } catch (error) {
      console.log('Failed to fetch roadmaps:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Cosmic Sketchbook?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await removeAuthToken();
            setUser(null);
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  const getFlatNodes = (rm) => {
    if (!rm) return [];
    if (Array.isArray(rm.nodes) && rm.nodes.length > 0) return rm.nodes;
    if (Array.isArray(rm.phases)) {
      return rm.phases.flatMap((phase) => phase.nodes || []);
    }
    return [];
  };

  const calculateProgress = (rm) => {
    const nodes = getFlatNodes(rm);
    if (!nodes.length) return 0;

    let completedCount = 0;
    const completedMap = rm.completedNodes || {};

    nodes.forEach((n) => {
      const isDone =
        n.completed ||
        (completedMap instanceof Map ? completedMap.get(n.id) : completedMap[n.id]);
      if (isDone) completedCount += 1;
    });

    return Math.round((completedCount / nodes.length) * 100);
  };

  const handleDeleteRoadmap = (roadmapItem) => {
    Alert.alert(
      'Delete Roadmap',
      `Delete "${roadmapItem.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(roadmapItem._id);
            try {
              await apiFetch(`/roadmaps/${roadmapItem._id}`, {
                method: 'DELETE',
              });
              setRoadmaps((prev) => prev.filter((r) => r._id !== roadmapItem._id));
            } catch (err) {
              Alert.alert('Delete Failed', err.message || 'Could not delete roadmap');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleGenerate = async (customTopic) => {
    const query = (customTopic || topicInput).trim();
    if (!query) {
      Alert.alert('Empty Topic', 'Please enter a skill or topic you would like to master.');
      return;
    }

    setGenerating(true);
    try {
      const roadmapData = await apiFetch('/generate', {
        method: 'POST',
        body: JSON.stringify({ topic: query }),
      });

      const flatNodes = getFlatNodes(roadmapData);

      if (
        roadmapData &&
        (flatNodes.length > 0 || (Array.isArray(roadmapData.phases) && roadmapData.phases.length > 0))
      ) {
        const normalizedRoadmap = {
          ...roadmapData,
          nodes: flatNodes,
        };

        setTopicInput('');
        let roadmapToView = normalizedRoadmap;

        try {
          const saved = await apiFetch('/roadmaps', {
            method: 'POST',
            body: JSON.stringify({
              title: roadmapData.title || query,
              description: roadmapData.description || '',
              phases: roadmapData.phases || [],
            }),
          });
          if (saved && saved._id) {
            roadmapToView = {
              ...saved,
              nodes: getFlatNodes(saved),
            };
          }
        } catch (e) {
          console.log('Auto-save generated roadmap info:', e.message);
        }

        fetchSavedRoadmaps();
        navigation.navigate('RoadmapView', { roadmap: roadmapToView });
      } else {
        Alert.alert('Generation Error', 'Could not parse roadmap response.');
      }
    } catch (error) {
      Alert.alert(
        'Generation Failed',
        error.message || 'Server error while creating roadmap.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const filteredRoadmaps = useMemo(() => {
    if (!searchQuery.trim()) return roadmaps;
    const q = searchQuery.toLowerCase().trim();
    return roadmaps.filter((r) => r.title?.toLowerCase().includes(q));
  }, [roadmaps, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgPaper} />
      <NotebookBackground showMargin={true}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchSavedRoadmaps();
              }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Notebook Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.brandRow}>
                <MaterialCommunityIcons name="book-open-page-variant" size={20} color={colors.primary} />
                <Text style={styles.brandTitle}>COSMIC SKETCHBOOK</Text>
              </View>
              <Text style={styles.welcomeText}>
                Hello, {user?.username || 'Explorer'}!
              </Text>
              <Text style={styles.subWelcomeText}>
                What skill will you map into reality today?
              </Text>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="logout-variant" size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Cosmo Assistant Banner */}
          <AvatarGuide
            message={
              generating
                ? "Cosmo is synthesizing your structured learning path with single-pass study links... ✨"
                : "Sketch a topic below or pick a curated track to start your journey."
            }
            mood={generating ? 'thinking' : 'happy'}
          />

          {/* Generator Input Card */}
          <View style={styles.generatorCard}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.ink} />
              <Text style={styles.cardHeaderTitle}>PROMPT SKETCHPAD</Text>
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={colors.inkMuted}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Master Rust, Next.js 15, Machine Learning..."
                placeholderTextColor={colors.inkMuted}
                value={topicInput}
                onChangeText={setTopicInput}
                onSubmitEditing={() => handleGenerate()}
                returnKeyType="go"
              />
              {topicInput.length > 0 && (
                <TouchableOpacity
                  onPress={() => setTopicInput('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons name="close-circle" size={18} color={colors.inkMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Inspiration Tags */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickTagsScroll}
              contentContainerStyle={styles.quickTagsContent}
            >
              {QUICK_TOPICS.map((tag, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  style={styles.quickTag}
                  onPress={() => setTopicInput(tag.replace(/^[^\w]+/, ''))}
                >
                  <Text style={styles.quickTagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Generate Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.generateBtn,
                generating && styles.btnDisabled,
              ]}
              disabled={generating}
              onPress={() => handleGenerate()}
            >
              {generating ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator color={colors.ink} size="small" />
                  <Text style={styles.generateBtnText}>Drawing Roadmap Graph...</Text>
                </View>
              ) : (
                <View style={styles.btnRow}>
                  <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.ink} />
                  <Text style={styles.generateBtnText}>Generate Custom Path</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Curated Tracks Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>EXPLORE CURATED TRACKS</Text>
            <SketchBadge
              label="Interactive"
              bgColor={colors.noteYellow}
              textColor={colors.yellowBadgeText}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsContent}
            style={styles.presetsScroll}
          >
            {PRESET_DOMAINS.map((domain, index) => {
              const rotation = (index % 2 === 0 ? -0.8 : 0.8);
              return (
                <TouchableOpacity
                  key={domain.id}
                  activeOpacity={0.8}
                  style={[
                    styles.presetCard,
                    {
                      backgroundColor: domain.bgColor,
                      transform: [{ rotate: `${rotation}deg` }],
                    },
                  ]}
                  onPress={() => handleGenerate(domain.topic)}
                  disabled={generating}
                >
                  <View style={styles.presetTopRow}>
                    <View style={styles.presetIconWrap}>
                      <MaterialCommunityIcons
                        name={domain.icon}
                        size={24}
                        color={colors.ink}
                      />
                    </View>
                    <MaterialCommunityIcons
                      name="arrow-top-right"
                      size={18}
                      color={colors.inkMuted}
                    />
                  </View>

                  <View style={{ flex: 1, justifyContent: 'center', marginVertical: 8 }}>
                    <Text style={styles.presetTitle}>{domain.title}</Text>
                    <Text style={styles.presetDesc} numberOfLines={2}>
                      {domain.desc}
                    </Text>
                  </View>

                  <View style={styles.presetActionRow}>
                    <Text style={styles.presetActionText}>Draw Path →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Saved Roadmaps Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>YOUR SAVED ROADMAPS</Text>
            <SketchBadge
              label={`${roadmaps.length} total`}
              bgColor={colors.noteGreen}
              textColor={colors.mintBadgeText}
            />
          </View>

          {/* Search bar if multiple roadmaps */}
          {roadmaps.length > 2 && (
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.inkMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search saved paths..."
                placeholderTextColor={colors.inkMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close" size={16} color={colors.inkMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {loading && !refreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Loading your sketchbooks...</Text>
            </View>
          ) : filteredRoadmaps.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="notebook-outline"
                size={44}
                color={colors.inkMuted}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching roadmaps found' : 'Your Sketchbook is Blank'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try a different search keyword'
                  : 'Type any skill above to draw your first interactive learning path.'}
              </Text>
            </View>
          ) : (
            filteredRoadmaps.map((item, index) => {
              const progress = calculateProgress(item);
              const nodes = getFlatNodes(item);
              const isDeleting = deletingId === item._id;

              return (
                <TouchableOpacity
                  key={item._id || `rm-${index}`}
                  activeOpacity={0.8}
                  style={styles.roadmapCard}
                  onPress={() => {
                    navigation.navigate('RoadmapView', {
                      roadmap: {
                        ...item,
                        nodes,
                      },
                    });
                  }}
                >
                  <View style={styles.roadmapHeader}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.roadmapTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.roadmapMeta}>
                        {nodes.length} topics • {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.badgeAndActionsRow}>
                      <View
                        style={[
                          styles.progressBadge,
                          {
                            backgroundColor:
                              progress === 100
                                ? colors.noteGreen
                                : progress > 0
                                ? colors.noteYellow
                                : colors.bgPaper,
                          },
                        ]}
                      >
                        <Text style={styles.progressBadgeText}>{progress}%</Text>
                      </View>

                      {/* Delete roadmap button */}
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteRoadmap(item)}
                        disabled={isDeleting}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {isDeleting ? (
                          <ActivityIndicator size="small" color={colors.error} />
                        ) : (
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={18}
                            color={colors.inkMuted}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Progress Bar Track */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progress}%`,
                          backgroundColor:
                            progress === 100 ? colors.success : colors.primary,
                        },
                      ]}
                    />
                  </View>

                  {item.remedialFor && (
                    <View style={styles.remedialTag}>
                      <MaterialCommunityIcons
                        name="stethoscope"
                        size={14}
                        color={colors.amberBadgeText}
                      />
                      <Text style={styles.remedialTagText}>
                        Targeted Remedial Course
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPaper,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderColor: colors.ink,
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
  },
  subWelcomeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkMuted,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  generatorCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.ink,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  quickTagsScroll: {
    marginBottom: 12,
  },
  quickTagsContent: {
    gap: 8,
  },
  quickTag: {
    backgroundColor: colors.bgPaperWarm,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quickTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
  },
  generateBtn: {
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.ink,
  },
  presetsScroll: {
    marginBottom: 18,
  },
  presetsContent: {
    paddingVertical: 6,
    paddingRight: 10,
    gap: 12,
  },
  presetCard: {
    width: 170,
    minHeight: 140,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  presetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.ink,
  },
  presetDesc: {
    fontSize: 11,
    color: colors.inkMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  presetActionRow: {
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.ink,
    paddingTop: 6,
  },
  presetActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginLeft: 6,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  roadmapCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  roadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  roadmapTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  roadmapMeta: {
    fontSize: 11,
    color: colors.inkMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  badgeAndActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBadge: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.ink,
  },
  deleteBtn: {
    padding: 4,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.sketchTrack,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.ink,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  remedialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: colors.noteOrange,
    borderWidth: 1,
    borderColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  remedialTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.amberBadgeText,
  },
});
