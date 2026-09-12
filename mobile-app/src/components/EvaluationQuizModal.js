import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function EvaluationQuizModal({ 
  quizData, 
  roadmapTitle, 
  onClose, 
  onSubmitQuiz, 
  onRedesignCourse 
}) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [error, setError] = useState('');

  if (!quizData || !quizData.questions) return null;

  const questions = quizData.questions;
  const currentQuestion = questions[currentQIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optIdx) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optIdx
    }));
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const evaluationResult = await onSubmitQuiz(quizData.quizId, userAnswers);
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
      await onRedesignCourse(roadmapTitle, results.weakTopics);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to redesign course.');
      setIsRedesigning(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <Modal
      visible={!!quizData}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {results ? 'Quiz Evaluation' : `Test: ${roadmapTitle}`}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* QUIZ TAKING VIEW */}
          {!results ? (
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }]} />
              </View>

              <Text style={styles.questionCounter}>Question {currentQIndex + 1} of {totalQuestions}</Text>

              <View style={styles.questionCard}>
                <Text style={styles.targetSkill}>Skill: {currentQuestion.targetSkill || 'Core Topic'}</Text>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
              </View>

              {/* Options */}
              <View style={styles.optionsList}>
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQuestion.id] === optIdx;
                  return (
                    <TouchableOpacity
                      key={optIdx}
                      style={[
                        styles.optionBtn,
                        isSelected && styles.optionBtnSelected
                      ]}
                      onPress={() => handleSelectOption(optIdx)}
                    >
                      <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
                        <Text style={[styles.optionBadgeText, isSelected && { color: '#fff' }]}>
                          {String.fromCharCode(65 + optIdx)}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Navigation controls */}
              <View style={styles.navControls}>
                <TouchableOpacity
                  style={[styles.navBtn, currentQIndex === 0 && styles.disabledBtn]}
                  onPress={handlePrev}
                  disabled={currentQIndex === 0}
                >
                  <Text style={styles.navBtnText}>Previous</Text>
                </TouchableOpacity>

                {currentQIndex < totalQuestions - 1 ? (
                  <TouchableOpacity style={[styles.navBtn, styles.primaryNavBtn]} onPress={handleNext}>
                    <Text style={styles.primaryNavBtnText}>Next</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.navBtn, styles.submitBtn, (isSubmitting || answeredCount < totalQuestions) && styles.disabledBtn]}
                    onPress={handleSubmit}
                    disabled={isSubmitting || answeredCount < totalQuestions}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={colors.ink} size="small" />
                    ) : (
                      <Text style={styles.submitBtnText}>Submit ({answeredCount}/{totalQuestions})</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          ) : (
            /* RESULTS VIEW */
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <View style={[styles.resultsCard, { backgroundColor: results.percentage >= 70 ? colors.noteGreen : colors.noteRose }]}>
                <Ionicons name="trophy" size={40} color={colors.ink} />
                <Text style={styles.scorePercentage}>{results.percentage}%</Text>
                <Text style={styles.scoreDetail}>You answered {results.score} of {results.total} questions correctly!</Text>
              </View>

              {results.weakTopics && results.weakTopics.length > 0 ? (
                <View style={styles.weakBox}>
                  <Text style={styles.weakTitle}>⚠️ Identifed Weak Skills:</Text>
                  {results.weakTopics.map((topic, i) => (
                    <Text key={i} style={styles.weakItem}>• {topic}</Text>
                  ))}
                </View>
              ) : (
                <View style={styles.perfectBox}>
                  <Text style={styles.perfectText}>🎉 Mastered! 100% correct answers!</Text>
                </View>
              )}

              <View style={styles.resultsActions}>
                <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
                  <Text style={styles.closeModalBtnText}>Close</Text>
                </TouchableOpacity>

                {results.weakTopics && results.weakTopics.length > 0 ? (
                  <TouchableOpacity
                    style={styles.redesignBtn}
                    onPress={handleTriggerRedesign}
                    disabled={isRedesigning}
                  >
                    {isRedesigning ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.redesignBtnText}>✨ Redesign Remedial Roadmap</Text>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            </ScrollView>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16
  },
  modalContainer: {
    backgroundColor: colors.bgPaper,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    maxHeight: '90%',
    padding: 20,
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.ink,
    flex: 1
  },
  body: {
    marginTop: 4
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary
  },
  questionCounter: {
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: 12
  },
  questionCard: {
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  targetSkill: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink
  },
  optionsList: {
    gap: 10,
    marginBottom: 20
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 12
  },
  optionBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.ink
  },
  optionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  optionBadgeSelected: {
    backgroundColor: colors.ink
  },
  optionBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.ink
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
    flex: 1
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold'
  },
  navControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white
  },
  primaryNavBtn: {
    backgroundColor: colors.primary
  },
  submitBtn: {
    backgroundColor: colors.noteGreen
  },
  disabledBtn: {
    opacity: 0.5
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink
  },
  primaryNavBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink
  },
  errorBox: {
    backgroundColor: colors.noteRose,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ink
  },
  errorText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 13
  },
  resultsCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    marginBottom: 16
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.ink,
    marginTop: 6
  },
  scoreDetail: {
    fontSize: 14,
    color: colors.ink,
    marginTop: 4
  },
  weakBox: {
    backgroundColor: colors.noteOrange,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  weakTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 8
  },
  weakItem: {
    fontSize: 13,
    color: colors.ink,
    marginBottom: 4
  },
  perfectBox: {
    backgroundColor: colors.noteGreen,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    marginBottom: 16
  },
  perfectText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink,
    textAlign: 'center'
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end'
  },
  closeModalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white
  },
  closeModalBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink
  },
  redesignBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.primary
  },
  redesignBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
  }
});
