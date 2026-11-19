import React, { useState } from 'react';
import { ArrowRight, Sparkles, School, Briefcase, Compass, Palette, BookOpen } from 'lucide-react';
import AvatarGuide from './AvatarGuide';
import InterestTreeVis from './InterestTreeVis';
import { apiUrl } from '../config/api';

const USER_CATEGORIES = [
  { label: 'High School', icon: School, desc: 'Building core foundations & discovering passions' },
  { label: 'College Student', icon: BookOpen, desc: 'Targeting internships, coursework & career skills' },
  { label: 'Professional', icon: Briefcase, desc: 'Upskilling, cross-training, or engineering pivot' },
  { label: 'Hobbyist', icon: Palette, desc: 'Creative projects & learning for the joy of it' },
  { label: 'Lifelong Learner', icon: Compass, desc: 'Broadening horizons & deep academic curiosity' }
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
    await fetchQuestion(4, [], []);
  };

  const fetchQuestion = async (step, currentHistory, currentAiTreePath = aiTreePath) => {
    setIsLoading(true);
    setError('');
    try {
      const existingLabels = [
        ...initialInterests,
        ...currentAiTreePath.map(item => (typeof item === 'string' ? item : item.label || item.treeNodeLabel))
      ].filter(Boolean);

      const response = await fetch(apiUrl('/api/generate/quiz-step'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userCategory,
          initialInterests,
          history: currentHistory, 
          stepNumber: step - 3,
          existingNodes: existingLabels
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
    const resolvedParent = currentQuestionData.parentNode || initialInterests[0] || 'General Focus';
    const newNode = {
      id: `ai-${aiTreePath.length}`,
      label: currentQuestionData.treeNodeLabel,
      parentNode: resolvedParent,
      parent: resolvedParent,
      selectedOption: option
    };
    const newAiTreePath = [...aiTreePath, newNode];
    
    setHistory(newHistory);
    setAiTreePath(newAiTreePath);

    if (currentStep < 13) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await fetchQuestion(nextStep, newHistory, newAiTreePath);
    } else {
      await finalizeOnboarding(newAiTreePath);
    }
  };

  const finalizeOnboarding = async (finalAiTreePath) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl('/api/auth/onboarding'), {
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

  const getProgressPercentage = () => {
    if (currentStep === 1) return 10;
    if (currentStep === 2) return 25;
    if (currentStep === 3) return 40;
    return Math.min(100, Math.round(40 + ((currentStep - 3) / 10) * 60));
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Left Column: Quiz */}
      <div style={{ flex: 1, padding: '36px 48px', display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
        
        {/* Top Header Row with Stepper Progress and Logout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span 
              style={{ 
                background: 'var(--note-yellow)', 
                border: '1.5px solid var(--color-ink)', 
                borderRadius: '8px', 
                padding: '4px 10px', 
                fontSize: '0.9rem', 
                fontWeight: 'bold',
                boxShadow: '2px 2px 0px var(--color-ink)'
              }}
            >
              {currentStep === 1 ? 'Step 1 of 4: Role' : currentStep === 2 ? 'Step 2 of 4: Keywords' : currentStep === 3 ? 'Step 3 of 4: Domains' : `Deep Dive Step ${currentStep - 3} of 10`}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {getProgressPercentage()}% completed
            </span>
          </div>

          <button 
            onClick={onLogout}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', fontWeight: 'bold' }}
          >
            Sign Out
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-paper)', border: '1.5px solid var(--color-ink)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ width: `${getProgressPercentage()}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <AvatarGuide 
            message={
              isLoading 
                ? "Cosmo is synthesizing your deep-dive questions... ✨" 
                : isSubmitting 
                  ? "Finalizing your custom learning profile... 🚀"
                  : currentStep === 1 
                    ? "Welcome! Which title best reflects your current learning stage?"
                    : currentStep === 2
                    ? "Pick keywords or broad paths that spark your curiosity:"
                    : currentStep === 3
                    ? "Choose 1 to 3 specific domains for your learning journey:"
                    : "Let's pinpoint your specific goals and preferences."
            } 
            emotion={isLoading ? 'thinking' : isSubmitting ? 'excited' : 'happy'} 
          />
        </div>

        {error && (
          <div style={{ background: 'var(--note-rose)', padding: '14px', border: '2px solid var(--color-ink)', borderRadius: '10px', marginBottom: '20px', boxShadow: '3px 3px 0px var(--color-ink)' }}>
            <p style={{ color: 'var(--color-error)', fontWeight: 'bold', marginBottom: '10px' }}>{error}</p>
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
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', marginBottom: '6px' }}>
              Select Your Learning Stage
            </h3>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.15rem', marginBottom: '20px' }}>
              This helps calibrate the curriculum depth and milestone pacing.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {USER_CATEGORIES.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={index}
                    className="btn btn-secondary"
                    style={{ 
                      textAlign: 'left', 
                      padding: '16px 20px', 
                      fontSize: '1.2rem', 
                      justifyContent: 'flex-start',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px'
                    }}
                    onClick={() => handleCategorySelect(cat.label)}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--note-yellow)', border: '1.5px solid var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color="var(--color-ink)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{cat.label}</div>
                      <div style={{ fontSize: '1.05rem', color: 'var(--color-ink-muted)' }}>{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Broad Keywords */}
        {currentStep === 2 && (
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', marginBottom: '6px' }}>
              Explore Topics & Paths
            </h3>
            <p style={{ fontSize: '1.15rem', marginBottom: '18px', color: 'var(--color-ink-muted)' }}>
              Select up to 5 broad keywords that interest you:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
              {BROAD_KEYWORDS.map(kw => {
                const isSelected = curatedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleCuratedKeyword(kw)}
                    style={{ 
                      borderRadius: '20px', 
                      padding: '8px 18px',
                      background: isSelected ? 'var(--note-yellow)' : 'var(--bg-paper)',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
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
              style={{ width: '100%', padding: '12px', fontSize: '1.2rem' }}
            >
              Continue to Domains <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Specific Domains */}
        {currentStep === 3 && (
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', margin: 0 }}>
                Choose Core Domains
              </h3>
              <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {initialInterests.length}/3 selected
              </span>
            </div>
            <p style={{ fontSize: '1.15rem', marginBottom: '18px', color: 'var(--color-ink-muted)' }}>
              Pick 1 to 3 domains for your AI deep-dive profiling:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
              {DOMAINS.map(domain => {
                const isSelected = initialInterests.includes(domain);
                return (
                  <button
                    key={domain}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleInterest(domain)}
                    style={{ 
                      borderRadius: '20px', 
                      padding: '10px 20px',
                      background: isSelected ? 'var(--note-green)' : 'var(--bg-paper)',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
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
              style={{ width: '100%', padding: '12px', fontSize: '1.2rem' }}
            >
              Begin AI Deep Dive <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 4+: Dynamic AI Questions */}
        {currentStep >= 4 && currentQuestionData && !isLoading && (
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span 
                style={{ 
                  background: 'var(--note-yellow)', 
                  border: '1.5px solid var(--color-ink)', 
                  borderRadius: '6px', 
                  padding: '2px 8px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold' 
                }}
              >
                Question {currentStep - 3} of 10
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--color-ink-muted)', fontWeight: 'bold' }}>
                Topic: {currentQuestionData.treeNodeLabel}
              </span>
            </div>

            <div style={{ background: 'var(--note-yellow)', padding: '24px', borderRadius: '14px', border: '2px solid var(--color-ink)', boxShadow: '4px 4px 0px var(--color-ink)', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.35rem', margin: 0, lineHeight: 1.4 }}>{currentQuestionData.question}</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQuestionData.options.map((option, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary"
                  onClick={() => handleOptionSelect(option)}
                  style={{ 
                    textAlign: 'left', 
                    padding: '14px 18px', 
                    fontSize: '1.15rem', 
                    justifyContent: 'flex-start',
                    borderRadius: '12px'
                  }}
                >
                  <span 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      border: '1.5px solid var(--color-ink)',
                      background: 'var(--bg-paper)', 
                      color: 'var(--color-ink)', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.9rem', 
                      fontWeight: 'bold', 
                      marginRight: '12px', 
                      flexShrink: 0 
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>
            <div className="spinner" style={{ width: '36px', height: '36px' }} />
            <p style={{ marginTop: '16px', fontSize: '1.2rem', color: 'var(--color-ink-muted)' }}>
              Synthesizing next personalization node...
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Dynamic Profile Tree */}
      <div style={{ width: '420px', borderLeft: '3px solid var(--color-ink)', display: 'flex', flexDirection: 'column', background: 'var(--bg-paper)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--color-ink)', background: 'var(--note-blue)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} />
          <span>Interactive Profile Graph</span>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <InterestTreeVis 
            userCategory={userCategory}
            initialInterests={initialInterests}
            aiTreePath={aiTreePath} 
          />
        </div>
      </div>
    </div>
  );
}
