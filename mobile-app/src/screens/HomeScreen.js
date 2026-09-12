import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiFetch, removeAuthToken } from '../config/api';
import AvatarGuide from '../components/AvatarGuide';

const PRESET_DOMAINS = [
  { id: '1', title: 'Frontend Developer', icon: 'laptop', topic: 'Full Stack Frontend Engineering with React & Web Standards' },
  { id: '2', title: 'Backend Architect', icon: 'server-network', topic: 'Node.js, Express, Microservices & Database Architecture' },
  { id: '3', title: 'AI & Machine Learning', icon: 'brain', topic: 'Machine Learning, Deep Learning, Python & PyTorch Roadmap' },
  { id: '4', title: 'Cybersecurity Specialist', icon: 'shield-lock', topic: 'Ethical Hacking, Network Security & Incident Response' },
  { id: '5', title: 'DevOps & Cloud Engineer', icon: 'cloud-tags', topic: 'Docker, Kubernetes, AWS & CI/CD Pipelines' },
  { id: '6', title: 'Data Scientist', icon: 'chart-bell-curve-cumulative', topic: 'Data Analysis, Pandas, Statistics & Data Visualization' },
];

export default function HomeScreen({ navigation, user, setUser }) {
  const [topicInput, setTopicInput] = useState('');
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleLogout = async () => {
    await removeAuthToken();
    setUser(null);
    navigation.replace('Auth');
  };

  const handleGenerate = async (customTopic) => {
    const query = (customTopic || topicInput).trim();
    if (!query) {
      Alert.alert('Empty Topic', 'Please enter what you would like to learn.');
      return;
    }

    setGenerating(true);
    try {
      const roadmapData = await apiFetch('/generate', {
        method: 'POST',
        body: JSON.stringify({ topic: query }),
      });

      if (roadmapData && roadmapData.nodes) {
        setTopicInput('');
        fetchSavedRoadmaps();
        navigation.navigate('RoadmapView', { roadmap: roadmapData });
      } else {
        Alert.alert('Generation Error', 'Could not parse roadmap response.');
      }
    } catch (error) {
      Alert.alert('Generation Failed', error.message || 'Server error while creating roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const calculateProgress = (nodes = []) => {
    if (!nodes.length) return 0;
    const completed = nodes.filter((n) => n.completed).length;
    return Math.round((completed / nodes.length) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgCanvas} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchSavedRoadmaps();
            }}
            tintColor={colors.brandDark}
          />
        }
      >
        {/* Top App Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>WELCOME BACK 👋</Text>
            <Text style={styles.headerTitle}>{user?.username || 'Explorer'}</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color={colors.sketchInk} />
          </TouchableOpacity>
        </View>

        {/* Cosmo Assistant Banner */}
        <AvatarGuide
          message={
            generating
              ? "Synthesizing full learning path with single-pass embedded study links..."
              : "What skill or technology would you like to master today?"
          }
          mood={generating ? 'thinking' : 'happy'}
        />

        {/* Custom Generator Card */}
        <View style={styles.generatorCard}>
          <Text style={styles.sectionLabel}>CREATE NEW ROADMAP</Text>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons
              name="auto-fix"
              size={20}
              color={colors.sketchSubtle}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. Master Rust Programming, Next.js 14..."
              placeholderTextColor={colors.sketchSubtle}
              value={topicInput}
              onChangeText={setTopicInput}
              onSubmitEditing={() => handleGenerate()}
            />
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, generating && styles.btnDisabled]}
            disabled={generating}
            onPress={() => handleGenerate()}
          >
            {generating ? (
              <ActivityIndicator color={colors.sketchInk} />
            ) : (
              <>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.sketchInk} />
                <Text style={styles.generateBtnText}>Generate Custom Path</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Curated Domain Presets */}
        <Text style={styles.sectionTitle}>EXPLORE CURATED DOMAINS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {PRESET_DOMAINS.map((domain) => (
            <TouchableOpacity
              key={domain.id}
              style={styles.presetCard}
              onPress={() => handleGenerate(domain.topic)}
              disabled={generating}
            >
              <View style={styles.presetIconWrap}>
                <MaterialCommunityIcons name={domain.icon} size={26} color={colors.sketchInk} />
              </View>
              <Text style={styles.presetTitle}>{domain.title}</Text>
              <Text style={styles.presetAction}>Generate Path →</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Saved Roadmaps Section */}
        <Text style={styles.sectionTitle}>YOUR SAVED ROADMAPS</Text>
        {loading && !refreshing ? (
          <ActivityIndicator color={colors.brandDark} style={{ marginVertical: 20 }} />
        ) : roadmaps.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="map-search-outline" size={40} color={colors.sketchSubtle} />
            <Text style={styles.emptyTitle}>No Roadmaps Generated Yet</Text>
            <Text style={styles.emptySub}>Type a topic above to create your first interactive learning path.</Text>
          </View>
        ) : (
          roadmaps.map((item) => {
            const progress = calculateProgress(item.nodes);
            return (
              <TouchableOpacity
                key={item._id}
                style={styles.roadmapCard}
                onPress={() => navigation.navigate('RoadmapView', { roadmap: item })}
              >
                <View style={styles.roadmapHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roadmapTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.roadmapMeta}>
                      {item.nodes?.length || 0} Topics • Created {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressBadgeText}>{progress}%</Text>
                  </View>
                </View>

                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>

                {item.remedialFor && (
                  <View style={styles.remedialTag}>
                    <MaterialCommunityIcons name="stethoscope" size={14} color={colors.amberBadgeText} />
                    <Text style={styles.remedialTagText}>Targeted Remedial Course</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'sans-serif',
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.sketchSubtle,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.sketchInk,
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatorCard: {
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: colors.sketchInk,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCanvas,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.sketchInk,
  },
  generateBtn: {
    backgroundColor: colors.yellowBadgeBg,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.sketchInk,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.sketchInk,
    marginBottom: 12,
  },
  presetScroll: {
    marginBottom: 24,
  },
  presetCard: {
    width: 160,
    backgroundColor: colors.mintBadgeBg,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    justifyContent: 'space-between',
    minHeight: 130,
  },
  presetIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.sketchInk,
  },
  presetAction: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brandDark,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.sketchInk,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: colors.sketchSubtle,
    textAlign: 'center',
    marginTop: 4,
  },
  roadmapCard: {
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.sketchInk,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  roadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  roadmapTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.sketchInk,
  },
  roadmapMeta: {
    fontSize: 12,
    color: colors.sketchSubtle,
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: colors.blueBadgeBg,
    borderWidth: 1.5,
    borderColor: colors.sketchInk,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.blueBadgeText,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.sketchTrack,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brandMint,
  },
  remedialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: colors.amberBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  remedialTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.amberBadgeText,
  },
});
