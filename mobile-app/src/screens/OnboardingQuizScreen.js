import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AvatarGuide from '../components/AvatarGuide';
import { apiFetch } from '../config/api';

const USER_CATEGORIES = ['High School', 'College Student', 'Professional', 'Hobbyist', 'Other'];
const DOMAINS = ['Software Dev', 'Cybersecurity', 'Design', 'Data Science', 'Finance', 'Writing', 'Hardware', 'Marketing'];

export default function OnboardingQuizScreen({ onOnboardingComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userCategory, setUserCategory] = useState('');
  const [initialInterests, setInitialInterests] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [aiTreePath, setAiTreePath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (domain) => {
    setInitialInterests(prev => {
      if (prev.includes(domain)) return prev.filter(d => d !== domain);
      if (prev.length < 3) return [...prev, domain];
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
          stepNumber: step - 2
        })
      });
      setCurrentQuestionData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch next question');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (option) => {
    const newHistory = [...history, { question: currentQuestionData.question, answer: option }];
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
          interestTree: finalAiTreePath
        })
      });
      onOnboardingComplete(updatedUser);
    } catch (err) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AvatarGuide
        message={
          loading ? "Cosmo is profiling your unique journey... ✨" :
          currentStep === 1 ? "Which best describes your current stage?" :
          currentStep === 2 ? "Select 1 to 3 core domains to explore:" :
          "Let's drill down into your specific interests."
        }
        emotion={loading ? 'thinking' : 'happy'}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* STEP 1: Category */}
      {currentStep === 1 && (
        <View style={styles.stepBox}>
          {USER_CATEGORIES.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionCard}
              onPress={() => {
                setUserCategory(cat);
                setCurrentStep(2);
              }}
            >
              <Ionicons name="school-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.optionCardText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* STEP 2: Initial Interests */}
      {currentStep === 2 && (
        <View style={styles.stepBox}>
          <View style={styles.chipsGrid}>
            {DOMAINS.map((domain, idx) => {
              const selected = initialInterests.includes(domain);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleInterest(domain)}
                >
                  <Text style={[styles.chipText, selected && { color: '#fff' }]}>{domain}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, initialInterests.length === 0 && styles.disabledBtn]}
            onPress={startDynamicQuiz}
            disabled={initialInterests.length === 0}
          >
            <Text style={styles.continueBtnText}>Continue to Deep-Dive</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* DYNAMIC AI STEPS */}
      {!loading && currentStep >= 3 && currentQuestionData && (
        <View style={styles.stepBox}>
          <Text style={styles.stepCounter}>Step {currentStep - 2} of 8</Text>
          <Text style={styles.questionTitle}>{currentQuestionData.question}</Text>

          <View style={styles.optionsList}>
            {currentQuestionData.options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionCard}
                onPress={() => handleOptionSelect(option)}
              >
                <Ionicons name="sparkles-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.optionCardText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.bgPaper,
    flexGrow: 1
  },
  errorBox: {
    backgroundColor: colors.noteRose,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    marginBottom: 16
  },
  errorText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 13
  },
  stepBox: {
    marginTop: 10
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginBottom: 6
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 20
  },
  optionsList: {
    gap: 12
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 2
  },
  optionCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    flex: 1
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24
  },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.ink
  },
  chipText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 10,
    paddingVertical: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 3
  },
  disabledBtn: {
    opacity: 0.5
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loadingBox: {
    marginTop: 40,
    alignItems: 'center'
  }
});
