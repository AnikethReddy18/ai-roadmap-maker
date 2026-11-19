import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiFetch } from '../config/api';
import SketchBadge from './SketchBadge';

export default function EvaluationQuizModal({
  quizData: initialQuizData,
  roadmapId,
  roadmapTitle,
  visible,
  onClose,
  onSubmitQuiz,
  onRedesignCourse,
  navigation,
}) {
  const [quizData, setQuizData] = useState(initialQuizData);
  const [loadingQuiz, setLoadingQuiz] = useState(!initialQuizData);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [error, setError] = useState('');

  const fetchQuiz = useCallback(async () => {
    setLoadingQuiz(true);
    setError('');
    try {
      const data = await apiFetch('/generate/course-quiz', {
        method: 'POST',
        body: JSON.stringify({ roadmapId }),
      });
      setQuizData(data);
    } catch (err) {
      setError(err.message || 'Failed to load evaluation quiz');
    } finally {
      setLoadingQuiz(false);
    }
  }, [roadmapId]);

  useEffect(() => {
    if (!initialQuizData && roadmapId && visible) {
      fetchQuiz();
    } else if (initialQuizData) {
      setQuizData(initialQuizData);
      setLoadingQuiz(false);
    }
  }, [roadmapId, initialQuizData, visible, fetchQuiz]);

  const questions = quizData?.questions || [];
  const currentQuestion = questions[currentQIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optIdx) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optIdx,
    }));
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      let evaluationResult;
      if (typeof onSubmitQuiz === 'function') {
        evaluationResult = await onSubmitQuiz(quizData.quizId, userAnswers);
      } else {
        evaluationResult = await apiFetch('/generate/evaluate-quiz', {
          method: 'POST',
          body: JSON.stringify({ quizId: quizData.quizId, userAnswers }),
        });
      }
      setResults(evaluationResult);
    } catch (err) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerRedesign = async () => {
    if (!results || !results.weakTopics || results.weakTopics.length === 0) return;
    setIsRedesigning(true);
    setError('');
    try {
      let remedialData;
      if (typeof onRedesignCourse === 'function') {
        remedialData = await onRedesignCourse(roadmapTitle, results.weakTopics);
      } else {
        remedialData = await apiFetch('/generate/redesign-course', {
          method: 'POST',
          body: JSON.stringify({ roadmapTitle, weakTopics: results.weakTopics }),
        });
      }
      onClose?.();
      if (remedialData && navigation) {
        navigation.push('RoadmapView', { roadmap: remedialData });
      }
    } catch (err) {
      setError(err.message || 'Failed to redesign course.');
      setIsRedesigning(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.headerSubtitle}>
                {results ? 'MASTERY REPORT' : '10-QUESTION TEST'}
              </Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {results ? 'Evaluation Assessment' : roadmapTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {loadingQuiz ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Synthesizing customized evaluation questions...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={24} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchQuiz}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !results && currentQuestion ? (
            /* Quiz Active View */
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Progress Tracker */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeaderRow}>
                  <Text style={styles.progressLabel}>
                    Question {currentQIndex + 1} of {totalQuestions}
                  </Text>
                  <Text style={styles.progressPercentText}>
                    {Math.round(((currentQIndex + 1) / totalQuestions) * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${((currentQIndex + 1) / totalQuestions) * 100}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Target Skill Badge */}
              {currentQuestion.targetSkill && (
                <SketchBadge
                  label={`Target Skill: ${currentQuestion.targetSkill}`}
                  bgColor={colors.noteYellow}
                  textColor={colors.yellowBadgeText}
                  icon={
                    <MaterialCommunityIcons
                      name="bullseye-arrow"
                      size={14}
                      color={colors.yellowBadgeText}
                    />
                  }
                  style={{ marginBottom: 12 }}
                />
              )}

              {/* Question Card */}
              <View style={styles.questionCard}>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
              </View>

              {/* Options List */}
              <View style={styles.optionsList}>
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQuestion.id] === optIdx;
                  return (
                    <TouchableOpacity
                      key={optIdx}
                      activeOpacity={0.8}
                      style={[
                        styles.optionBtn,
                        isSelected && styles.optionBtnSelected,
                      ]}
                      onPress={() => handleSelectOption(optIdx)}
                    >
                      <View
                        style={[
                          styles.optionBadge,
                          isSelected && styles.optionBadgeSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionBadgeText,
                            isSelected && { color: colors.white },
                          ]}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Nav Controls */}
              <View style={styles.navControls}>
                <TouchableOpacity
                  style={[styles.navBtn, currentQIndex === 0 && styles.disabledBtn]}
                  onPress={handlePrev}
                  disabled={currentQIndex === 0}
                >
                  <MaterialCommunityIcons name="arrow-left" size={16} color={colors.ink} />
                  <Text style={styles.navBtnText}>Previous</Text>
                </TouchableOpacity>

                {currentQIndex < totalQuestions - 1 ? (
                  <TouchableOpacity
                    style={[styles.navBtn, styles.primaryNavBtn]}
                    onPress={handleNext}
                  >
                    <Text style={styles.primaryNavBtnText}>Next Question</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color={colors.white} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.navBtn,
                      styles.submitBtn,
                      (isSubmitting || answeredCount < totalQuestions) && styles.disabledBtn,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting || answeredCount < totalQuestions}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={colors.ink} size="small" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-all" size={18} color={colors.ink} />
                        <Text style={styles.submitBtnText}>
                          Submit Test ({answeredCount}/{totalQuestions})
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          ) : results ? (
            /* Results View */
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <View
                style={[
                  styles.resultsCard,
                  {
                    backgroundColor:
                      results.percentage >= 70 ? colors.noteGreen : colors.noteRose,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={results.percentage >= 70 ? 'trophy-award' : 'clipboard-alert-outline'}
                  size={48}
                  color={colors.ink}
                />
                <Text style={styles.scorePercentage}>{results.percentage}%</Text>
                <Text style={styles.scoreDetail}>
                  You answered {results.score} of {results.total} questions correctly!
                </Text>
                <Text style={styles.scoreVerdict}>
                  {results.percentage >= 70
                    ? '🎉 Mastered! You demonstrated strong retention.'
                    : '📖 Keep going! A little targeted revision will get you there.'}
                </Text>
              </View>

              {results.weakTopics && results.weakTopics.length > 0 ? (
                <View style={styles.weakBox}>
                  <View style={styles.weakHeaderRow}>
                    <MaterialCommunityIcons name="target" size={18} color={colors.amberBadgeText} />
                    <Text style={styles.weakTitle}>Identified Focus Areas</Text>
                  </View>
                  <Text style={styles.weakSubText}>
                    Cosmo detected opportunities to strengthen these specific topics:
                  </Text>
                  {results.weakTopics.map((topic, i) => (
                    <View key={i} style={styles.weakItemRow}>
                      <Text style={styles.weakBullet}>•</Text>
                      <Text style={styles.weakItemText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.perfectBox}>
                  <Text style={styles.perfectText}>🌟 Outstanding! Perfect retention score!</Text>
                </View>
              )}

              <View style={styles.resultsActions}>
                {results.weakTopics && results.weakTopics.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.redesignBtn}
                    onPress={handleTriggerRedesign}
                    disabled={isRedesigning}
                  >
                    {isRedesigning ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="auto-fix" size={20} color={colors.white} />
                        <Text style={styles.redesignBtnText}>
                          Build Remedial Roadmap
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.closeModalBtn}
                  onPress={onClose}
                >
                  <Text style={styles.closeModalBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.bgPaper,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 18,
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.sketchTrack,
    marginBottom: 14,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.inkMuted,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.noteRose,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
    textAlign: 'center',
    marginVertical: 8,
  },
  retryBtn: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  body: {
    flexGrow: 0,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.inkMuted,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.sketchTrack,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  questionCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 20,
  },
  optionsList: {
    gap: 10,
    marginBottom: 18,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  optionBtnSelected: {
    backgroundColor: colors.noteYellow,
    borderColor: colors.ink,
    transform: [{ translateX: 1 }, { translateY: 1 }],
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
  optionBadgeSelected: {
    backgroundColor: colors.primary,
  },
  optionBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.ink,
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  optionTextSelected: {
    fontWeight: '900',
  },
  navControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.bgCard,
    gap: 6,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  primaryNavBtn: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  primaryNavBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.white,
  },
  submitBtn: {
    backgroundColor: colors.noteGreen,
    flex: 1,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.ink,
  },
  disabledBtn: {
    opacity: 0.45,
  },
  resultsCard: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  scorePercentage: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 8,
  },
  scoreDetail: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
  },
  scoreVerdict: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  weakBox: {
    backgroundColor: colors.noteOrange,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  weakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  weakTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.amberBadgeText,
  },
  weakSubText: {
    fontSize: 11,
    color: colors.ink,
    marginBottom: 8,
    fontWeight: '600',
  },
  weakItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  weakBullet: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.amberBadgeText,
    marginRight: 6,
  },
  weakItemText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  perfectBox: {
    backgroundColor: colors.noteGreen,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  perfectText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.mintBadgeText,
  },
  resultsActions: {
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  redesignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  redesignBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.white,
  },
  closeModalBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 12,
  },
  closeModalBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
});
