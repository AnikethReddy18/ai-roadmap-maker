import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import AvatarGuide from './AvatarGuide';
import InterestTreeVis from './InterestTreeVis';

const USER_CATEGORIES = [
  'High School',
  'College Student',
  'Professional',
  'Hobbyist',
  'Other'
];

const BROAD_KEYWORDS = [
  'Science (PCM)', 'Commerce', 'Arts & Humanities', 'Web Development', 
  'Photography', 'Finance', 'Creative Writing', 'Robotics', 'Design', 'Software Dev'
];

const DOMAINS = [
  'Software Dev',
  'Cybersecurity',
  'Design',
  'Data Science',
  'Finance',
  'Writing',
  'Hardware',
  'Marketing',
  'Healthcare',
  'Arts & Music'
];

export default function OnboardingQuiz({ token, onComplete, onLogout, onSaveKey }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userCategory, setUserCategory] = useState('');
  const [curatedKeywords, setCuratedKeywords] = useState([]);
  const [initialInterests, setInitialInterests] = useState([]);
  
  const [history, setHistory] = useState([]);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [aiTreePath, setAiTreePath] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCategorySelect = (category) => {
    setUserCategory(category);
    setCurrentStep(2);
  };

  const toggleCuratedKeyword = (kw) => {
    setCuratedKeywords(prev => {
      if (prev.includes(kw)) return prev.filter(k => k !== kw);
      if (prev.length < 5) return [...prev, kw];
      return prev;
    });
  };

  const toggleInterest = (domain) => {
    setInitialInterests(prev => {
      if (prev.includes(domain)) return prev.filter(d => d !== domain);
      if (prev.length < 3) return [...prev, domain];
      return prev;
    });
  };

  const startDynamicQuiz = async () => {
    if (initialInterests.length === 0) return;
    setCurrentStep(4);
    await fetchQuestion(4, []);
  };

  const fetchQuestion = async (step, currentHistory) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate/quiz-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userCategory,
          initialInterests,
          history: currentHistory, 
          stepNumber: step - 3 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch question');
      
      setCurrentQuestionData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (option) => {
    const newHistory = [...history, { question: currentQuestionData.question, answer: option }];
    const newAiTreePath = [...aiTreePath, currentQuestionData.treeNodeLabel];
    
    setHistory(newHistory);
    setAiTreePath(newAiTreePath);

    if (currentStep < 13) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await fetchQuestion(nextStep, newHistory);
    } else {
      await finalizeOnboarding(newAiTreePath);
    }
  };

  const finalizeOnboarding = async (finalAiTreePath) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          userCategory,
          curatedKeywords,
          initialInterests,
          interestTree: finalAiTreePath 
        })
      });
      const updatedUser = await response.json();
      if (!response.ok) throw new Error(updatedUser.error || 'Onboarding failed');
      onComplete(updatedUser);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Left Column: Quiz */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
        
        <button 
          onClick={onLogout}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}
        >
          Sign Out / Switch Account
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <AvatarGuide 
            message={
              isLoading 
                ? "Cosmo is calculating your deep-dive... ✨" 
                : isSubmitting 
                  ? "Finalizing your stellar profile... 🚀"
                  : currentStep === 1 
                    ? "Welcome! Which best describes your current stage?"
                    : currentStep === 2
                    ? "What general topics or paths are you curious about?"
                    : currentStep === 3
                    ? "Great! Which domains do you want to deep-dive into?"
                    : "Let's drill down further into your specific interests."
            } 
            emotion={isLoading ? 'thinking' : isSubmitting ? 'excited' : 'happy'} 
          />
        </div>

        {error && (
          <div style={{ background: 'var(--note-rose)', padding: '12px', border: '2px solid var(--color-ink)', marginBottom: '20px' }}>
            <p style={{ color: 'var(--color-error)', fontWeight: 'bold', marginBottom: '12px' }}>{error}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => currentStep <= 13 ? fetchQuestion(currentStep, history) : finalizeOnboarding(aiTreePath)}>Retry</button>
              {(error.toLowerCase().includes('api') || error.toLowerCase().includes('key') || error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate')) && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    const newKey = window.prompt("Enter your new Gemini API Key:");
                    if (newKey && newKey.trim() !== "") {
                      onSaveKey(newKey.trim());
                    }
                  }}
                >
                  Update API Key
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Static Category */}
        {currentStep === 1 && (
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {USER_CATEGORIES.map((cat, index) => (
                <button
                  key={index}
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', padding: '16px', fontSize: '1.2rem', justifyContent: 'flex-start' }}
                  onClick={() => handleCategorySelect(cat)}
                >
                  <Sparkles size={18} style={{ marginRight: '8px', color: 'var(--color-primary)' }}/>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Broad Keywords */}
        {currentStep === 2 && (
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--color-ink-muted)' }}>What general topics or paths are you curious about?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              {BROAD_KEYWORDS.map(kw => {
                const isSelected = curatedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleCuratedKeyword(kw)}
                    style={{ borderRadius: '20px', padding: '8px 16px' }}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="btn btn-primary" 
              disabled={curatedKeywords.length === 0}
              onClick={() => setCurrentStep(3)}
              style={{ width: '100%' }}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Specific Domains */}
        {currentStep === 3 && (
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--color-ink-muted)' }}>Select 1 to 3 specific domains for your AI deep-dive:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              {DOMAINS.map(domain => {
                const isSelected = initialInterests.includes(domain);
                return (
                  <button
                    key={domain}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleInterest(domain)}
                    style={{ borderRadius: '20px', padding: '8px 16px' }}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="btn btn-primary" 
              disabled={initialInterests.length === 0}
              onClick={startDynamicQuiz}
              style={{ width: '100%' }}
            >
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Steps 4-13: Dynamic AI Questions */}
        {!isLoading && !isSubmitting && currentStep >= 4 && currentQuestionData && (
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem' }}>Step {currentStep - 3} of 10</h2>
            </div>
            
            <p style={{ fontSize: '1.4rem', marginBottom: '32px' }}>
              {currentQuestionData.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', padding: '16px', fontSize: '1.2rem', justifyContent: 'flex-start' }}
                  onClick={() => handleOptionSelect(option)}
                >
                  <Sparkles size={18} style={{ marginRight: '8px', color: 'var(--color-primary)' }}/>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Visual Tree */}
      <div style={{ flex: 1, borderLeft: '3px solid var(--color-ink)', background: 'var(--bg-paper)', position: 'relative' }}>
        <InterestTreeVis 
          userCategory={userCategory} 
          initialInterests={initialInterests} 
          aiTreePath={aiTreePath} 
        />
      </div>
    </div>
  );
}
