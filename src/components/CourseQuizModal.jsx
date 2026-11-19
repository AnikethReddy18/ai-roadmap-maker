import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Check
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
  const progressPercent = Math.round(((currentQIndex + 1) / totalQuestions) * 100);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {results ? 'MASTERY REPORT' : '10-QUESTION TEST'}
            </span>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', marginTop: '2px' }}>
              {results ? 'Quiz Evaluation Results' : `Evaluation: ${roadmapTitle}`}
            </h3>
            {!results && (
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.05rem', marginTop: '2px' }}>
                Question {currentQIndex + 1} of {totalQuestions} ({progressPercent}%)
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
        {!results && currentQuestion && (
          <div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '10px', background: 'var(--bg-paper)', border: '2px solid var(--color-ink)', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
            </div>

            <div style={{ background: 'var(--note-yellow)', padding: '20px', borderRadius: '12px', border: '2px solid var(--color-ink)', boxShadow: '4px 4px 0px var(--color-ink)', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-ink-muted)', display: 'inline-block', marginBottom: '4px' }}>
                Target Skill: {currentQuestion.targetSkill || 'Core Skill'}
              </span>
              <h4 style={{ fontSize: '1.3rem', margin: 0, lineHeight: 1.4 }}>{currentQuestion.question}</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestion.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      textAlign: 'left', 
                      padding: '14px 18px', 
                      fontSize: '1.15rem', 
                      justifyContent: 'flex-start', 
                      borderRadius: '12px',
                      background: isSelected ? 'var(--note-yellow)' : 'var(--bg-paper)',
                      borderColor: 'var(--color-ink)',
                      transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                      boxShadow: isSelected ? '4px 4px 0px var(--color-ink)' : '2px 2px 0px var(--color-ink)'
                    }}
                  >
                    <span 
                      style={{ 
                        width: '30px', 
                        height: '30px', 
                        borderRadius: '50%', 
                        border: '1.5px solid var(--color-ink)',
                        background: isSelected ? 'var(--color-ink)' : '#e2e8f0', 
                        color: isSelected ? '#fff' : 'var(--color-ink)', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.95rem', 
                        fontWeight: 'bold', 
                        marginRight: '12px', 
                        flexShrink: 0 
                      }}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isSelected && <Check size={18} style={{ color: 'var(--color-ink)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handlePrev} 
                disabled={currentQIndex === 0}
                style={{ opacity: currentQIndex === 0 ? 0.5 : 1 }}
              >
                <ArrowLeft size={16} /> Previous
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
                  style={{ 
                    background: 'var(--note-green)', 
                    color: 'var(--color-ink)',
                    opacity: (isSubmitting || answeredCount < totalQuestions) ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Evaluating Test...' : `Submit Evaluation (${answeredCount}/${totalQuestions})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. RESULTS & WEAK AREA REDESIGN MODE */}
        {results && (
          <div>
            <div style={{ textAlign: 'center', padding: '28px', background: results.percentage >= 70 ? 'var(--note-green)' : 'var(--note-rose)', borderRadius: '14px', border: '2px solid var(--color-ink)', boxShadow: '6px 6px 0px var(--color-ink)', marginBottom: '28px' }}>
              <Award size={52} style={{ marginBottom: '8px' }} />
              <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)' }}>
                {results.percentage}% Score
              </h2>
              <p style={{ fontSize: '1.25rem', marginTop: '4px', fontWeight: 'bold' }}>
                You scored {results.score} out of {results.total} questions correctly!
              </p>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                {results.percentage >= 70 
                  ? '🎉 Outstanding! You demonstrated strong retention of key skills.' 
                  : '📖 Good effort! Targeted revision on identified weak topics will help you master this path.'}
              </p>
            </div>

            {/* Weak topics breakdown */}
            {results.weakTopics && results.weakTopics.length > 0 ? (
              <div style={{ marginBottom: '28px', background: 'var(--note-orange)', padding: '20px', borderRadius: '12px', border: '2px solid var(--color-ink)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
                  <AlertTriangle size={22} />
                  Identified Focus Areas:
                </div>
                <p style={{ fontSize: '1.05rem', color: 'var(--color-ink-muted)', marginBottom: '10px' }}>
                  Cosmo spotted opportunities to deepen understanding in these specific areas:
                </p>
                <ul style={{ paddingLeft: '24px', fontSize: '1.15rem' }}>
                  {results.weakTopics.map((topic, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{topic}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ marginBottom: '28px', background: 'var(--note-green)', padding: '20px', borderRadius: '12px', border: '2px solid var(--color-ink)', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                <CheckCircle size={28} style={{ display: 'block', margin: '0 auto 8px auto' }} />
                🎉 Flawless Mastery! You aced every concept on this roadmap!
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px', flexWrap: 'wrap' }}>
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
                    'Redesigning Remedial Path...'
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Build Remedial Roadmap for Weak Areas
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
