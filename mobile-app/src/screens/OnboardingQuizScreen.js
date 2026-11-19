import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AvatarGuide from '../components/AvatarGuide';
import NotebookBackground from '../components/NotebookBackground';
import SketchBadge from '../components/SketchBadge';
import InterestTreeVis from '../components/InterestTreeVis';
import { apiFetch } from '../config/api';

const USER_CATEGORIES = [
  { label: 'High School', icon: 'school-outline', desc: 'Exploring foundations & future careers' },
  { label: 'College Student', icon: 'book-education-outline', desc: 'Preparing for internships & core skills' },
  { label: 'Professional', icon: 'briefcase-outline', desc: 'Upskilling, pivoting, or leveling up' },
  { label: 'Hobbyist', icon: 'palette-outline', desc: 'Tinkering and learning for pure curiosity' },
  { label: 'Lifelong Learner', icon: 'compass-outline', desc: 'Broadening horizons and deep dives' },
];

const DOMAINS = [
  { label: 'Software Dev', icon: 'laptop', color: colors.noteBlue },
  { label: 'Cybersecurity', icon: 'shield-lock-outline', color: colors.noteRose },
  { label: 'AI & Data', icon: 'brain', color: colors.notePurple },
  { label: 'Design & UI/UX', icon: 'draw-pen', color: colors.noteYellow },
  { label: 'Cloud & DevOps', icon: 'cloud-tags', color: colors.noteGreen },
  { label: 'Finance & FinTech', icon: 'chart-line', color: colors.noteOrange },
  { label: 'Hardware & IoT', icon: 'chip', color: colors.noteBlue },
  { label: 'Writing & Research', icon: 'file-document-edit-outline', color: colors.noteYellow },
];

export default function OnboardingQuizScreen({
  onOnboardingComplete,
  navigation,
  setUser,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userCategory, setUserCategory] = useState('');
  const [initialInterests, setInitialInterests] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [aiTreePath, setAiTreePath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (domainLabel) => {
    setInitialInterests((prev) => {
      if (prev.includes(domainLabel)) {
        return prev.filter((d) => d !== domainLabel);
      }
      if (prev.length < 3) {
        return [...prev, domainLabel];
      }
      return prev;
    });
  };

  const startDynamicQuiz = async () => {
    if (initialInterests.length === 0) return;
    setCurrentStep(3);
    await fetchQuestion(3, []);
  };

  const fetchQuestion = async (step, currentHistory) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/generate/quiz-step', {
        method: 'POST',
        body: JSON.stringify({
          userCategory,
          initialInterests,
          history: currentHistory,
          stepNumber: step - 2,
        }),
      });
      setCurrentQuestionData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch next question');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (option) => {
    const newHistory = [
      ...history,
      { question: currentQuestionData.question, answer: option },
    ];
    const newAiTreePath = [...aiTreePath, currentQuestionData.treeNodeLabel];

    setHistory(newHistory);
    setAiTreePath(newAiTreePath);

    if (currentStep < 10) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await fetchQuestion(nextStep, newHistory);
    } else {
      await finalizeOnboarding(newAiTreePath);
    }
  };

  const finalizeOnboarding = async (finalAiTreePath) => {
    setLoading(true);
    try {
      const updatedUser = await apiFetch('/api/auth/onboarding', {
        method: 'PUT',
        body: JSON.stringify({
          userCategory,
          initialInterests,
          interestTree: finalAiTreePath,
        }),
      });
      if (typeof onOnboardingComplete === 'function') {
        onOnboardingComplete(updatedUser);
      } else {
        setUser?.(updatedUser);
        navigation?.replace('Home');
      }
    } catch (err) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgressPercent = () => {
    if (currentStep === 1) return 15;
    if (currentStep === 2) return 30;
    return 30 + ((currentStep - 2) / 8) * 70;
  };

  return (
    <NotebookBackground showMargin={true}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgPaper} />
        {/* Top Progress Tracker */}
        <View style={styles.topProgressArea}>
          <View style={styles.topProgressHeader}>
            <Text style={styles.topStepBadge}>
              {currentStep === 1
                ? 'PHASE 1: BACKGROUND'
                : currentStep === 2
                ? 'PHASE 2: CORE DOMAINS'
                : `DEEP DIVE STEP ${currentStep - 2} OF 8`}
            </Text>
            <Text style={styles.topStepPercent}>
              {Math.round(getStepProgressPercent())}%
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${getStepProgressPercent()}%` },
              ]}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cosmo Guide */}
          <AvatarGuide
            message={
              loading
                ? "Cosmo is profiling your bespoke learning trajectory... ✨"
                : currentStep === 1
                ? "Which title best reflects your current learning journey?"
                : currentStep === 2
                ? "Choose 1 to 3 core areas you are keen to master:"
                : "Let's pinpoint your specific goals and preferences."
            }
            mood={loading ? 'thinking' : currentStep === 2 ? 'excited' : 'happy'}
          />

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* STEP 1: Category */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Select Your Learning Stage</Text>
              <Text style={styles.stepSubtitle}>
                This helps tailor roadmap depth and exercise pacing.
              </Text>

              <View style={styles.cardsList}>
                {USER_CATEGORIES.map((cat, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    style={styles.categoryCard}
                    onPress={() => {
                      setUserCategory(cat.label);
                      setCurrentStep(2);
                    }}
                  >
                    <View style={styles.catIconWrap}>
                      <MaterialCommunityIcons
                        name={cat.icon}
                        size={22}
                        color={colors.ink}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.categoryTitle}>{cat.label}</Text>
                      <Text style={styles.categoryDesc}>{cat.desc}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={colors.inkMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 2: Initial Interests */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.stepTitleRow}>
                <Text style={styles.stepTitle}>Pick 1 to 3 Domains</Text>
                <SketchBadge
                  label={`${initialInterests.length}/3 selected`}
                  bgColor={initialInterests.length > 0 ? colors.noteGreen : colors.bgPaper}
                  textColor={colors.ink}
                />
              </View>
              <Text style={styles.stepSubtitle}>
                Choose what aligns best with your immediate goals.
              </Text>

              <View style={styles.chipsGrid}>
                {DOMAINS.map((domain, idx) => {
                  const selected = initialInterests.includes(domain.label);
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        { backgroundColor: selected ? colors.noteYellow : colors.bgCard },
                        selected && styles.chipSelected,
                      ]}
                      onPress={() => toggleInterest(domain.label)}
                    >
                      <MaterialCommunityIcons
                        name={selected ? 'check-circle' : domain.icon}
                        size={18}
                        color={selected ? colors.yellowBadgeText : colors.ink}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {domain.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.continueBtn,
                  initialInterests.length === 0 && styles.disabledBtn,
                ]}
                onPress={startDynamicQuiz}
                disabled={initialInterests.length === 0}
              >
                <Text style={styles.continueBtnText}>
                  Continue to Deep Dive
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color={colors.ink}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* DYNAMIC AI STEPS */}
          {!loading && currentStep >= 3 && currentQuestionData && (
            <View style={styles.stepContainer}>
              <View style={styles.stepTitleRow}>
                <SketchBadge
                  label={`Step ${currentStep - 2} of 8`}
                  bgColor={colors.noteYellow}
                  textColor={colors.yellowBadgeText}
                />
                {currentQuestionData.treeNodeLabel ? (
                  <Text style={styles.nodeLabelText}>
                    Focus: {currentQuestionData.treeNodeLabel}
                  </Text>
                ) : null}
              </View>

              <View style={styles.questionCard}>
                <Text style={styles.questionTitle}>
                  {currentQuestionData.question}
                </Text>
              </View>

              <View style={styles.optionsList}>
                {currentQuestionData.options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    style={styles.optionCard}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <View style={styles.optionBadge}>
                      <Text style={styles.optionBadgeText}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={styles.optionCardText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Skip / Finish Early button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.skipBtn}
                onPress={() => finalizeOnboarding(aiTreePath)}
              >
                <Text style={styles.skipBtnText}>Skip and Build My Roadmap Early</Text>
                <MaterialCommunityIcons name="fast-forward" size={16} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Interactive Interest Tree Visualization */}
          {currentStep >= 2 && (
            <InterestTreeVis
              userCategory={userCategory}
              initialInterests={initialInterests}
              aiTreePath={aiTreePath}
            />
          )}

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingLabel}>
                Synthesizing custom questions...
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </NotebookBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topProgressArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.bgPaperWarm,
  },
  topProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  topStepBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.inkMuted,
    letterSpacing: 1,
  },
  topStepPercent: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.bgPaper,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.noteRose,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: colors.error,
    fontWeight: '800',
    fontSize: 12,
    flex: 1,
  },
  stepContainer: {
    marginTop: 10,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  stepSubtitle: {
    fontSize: 12,
    color: colors.inkMuted,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardsList: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  catIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.bgPaper,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  categoryDesc: {
    fontSize: 11,
    color: colors.inkMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipSelected: {
    borderColor: colors.ink,
    transform: [{ translateX: 1 }, { translateY: 1 }],
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.yellowBadgeText,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  continueBtnText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  nodeLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.inkMuted,
  },
  questionCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 22,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.bgPaper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.ink,
  },
  optionCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    flex: 1,
    lineHeight: 18,
  },
  loadingBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.inkMuted,
    backgroundColor: 'transparent',
    gap: 6,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
  },
});
