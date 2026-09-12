import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function CourseQuizModal({ 
  quizData, 
  roadmapTitle, 
  onClose, 
  onSubmitQuiz,
  onRedesignCourse 
}) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: optionIndex }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [error, setError] = useState('');

  if (!quizData || !quizData.questions) return null;

  const questions = quizData.questions;
  const currentQuestion = questions[currentQIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
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
      setError(err.message || 'Failed to submit evaluation quiz.');
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
      setError(err.message || 'Failed to generate remedial course.');
      setIsRedesigning(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} />
      <div 
        className="modal" 
        style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          maxWidth: '680px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1000,
          background: 'var(--bg-paper)',
          border: '3px solid var(--color-ink)',
          borderRadius: '16px',
          boxShadow: '10px 10px 0px var(--color-ink)',
          padding: '32px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem' }}>
              {results ? 'Quiz Evaluation Results' : `Final Evaluation: ${roadmapTitle}`}
            </h3>
            {!results && (
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.05rem' }}>
                Question {currentQIndex + 1} of {totalQuestions}
              </p>
            )}
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close Quiz">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--note-rose)', padding: '12px', border: '2px solid var(--color-ink)', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', color: 'var(--color-error)' }}>
            {error}
          </div>
        )}

        {/* 1. QUIZ QUESTIONS MODE */}
        {!results && (
          <div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s' }} />
            </div>

            <div style={{ background: 'var(--note-yellow)', padding: '20px', borderRadius: '12px', border: '2px solid var(--color-ink)', boxShadow: '4px 4px 0px var(--color-ink)', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-ink-muted)' }}>
                Target Skill: {currentQuestion.targetSkill || 'Core Skill'}
              </span>
              <h4 style={{ fontSize: '1.25rem', marginTop: '6px' }}>{currentQuestion.question}</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestion.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textAlign: 'left', padding: '14px', fontSize: '1.1rem', justifyContent: 'flex-start', borderRadius: '10px' }}
                  >
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: isSelected ? 'var(--color-ink)' : '#e5e7eb', color: isSelected ? '#fff' : 'var(--color-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold', marginRight: '10px', flexShrink: 0 }}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handlePrev} 
                disabled={currentQIndex === 0}
              >
                Previous
              </button>

              {currentQIndex < totalQuestions - 1 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNext}
                >
                  Next Question <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredCount < totalQuestions}
                  style={{ background: 'var(--note-green)', color: 'var(--color-ink)' }}
                >
                  {isSubmitting ? 'Evaluating...' : `Submit Evaluation (${answeredCount}/${totalQuestions})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. RESULTS & WEAK AREA REDESIGN MODE */}
        {results && (
          <div>
            <div style={{ textAlign: 'center', padding: '24px', background: results.percentage >= 70 ? 'var(--note-green)' : 'var(--note-rose)', borderRadius: '12px', border: '2px solid var(--color-ink)', boxShadow: '6px 6px 0px var(--color-ink)', marginBottom: '28px' }}>
              <Award size={48} style={{ marginBottom: '8px' }} />
              <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)' }}>
                {results.percentage}% Score
              </h2>
              <p style={{ fontSize: '1.2rem', marginTop: '4px' }}>
                You scored {results.score} out of {results.total} questions correctly!
              </p>
            </div>

            {/* Weak topics breakdown */}
            {results.weakTopics && results.weakTopics.length > 0 ? (
              <div style={{ marginBottom: '28px', background: 'var(--note-orange)', padding: '20px', borderRadius: '12px', border: '2px solid var(--color-ink)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
                  <AlertTriangle size={22} />
                  Identified Weak Areas:
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '1.1rem' }}>
                  {results.weakTopics.map((topic, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{topic}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ marginBottom: '28px', background: 'var(--note-green)', padding: '20px', borderRadius: '12px', border: '2px solid var(--color-ink)', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                🎉 Flawless! You mastered every concept on this roadmap!
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Close Evaluation
              </button>

              {results.weakTopics && results.weakTopics.length > 0 && (
                <button 
                  className="btn btn-primary" 
                  onClick={handleTriggerRedesign}
                  disabled={isRedesigning}
                  style={{ background: 'var(--color-primary)', color: '#fff' }}
                >
                  {isRedesigning ? (
                    'Redesigning Course...'
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Redesign Remedial Roadmap for Weak Areas
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
