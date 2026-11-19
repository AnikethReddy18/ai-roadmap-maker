import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Cpu, 
  LogOut,
  Compass,
  Brain,
  Search,
  X,
  ArrowRight
} from 'lucide-react';

import RoadmapView from './components/RoadmapView';
import NodeDrawer from './components/NodeDrawer';
import SettingsModal from './components/SettingsModal';
import AuthPortal from './components/AuthPortal';
import OnboardingQuiz from './components/OnboardingQuiz';
import InterestTreeVis from './components/InterestTreeVis';
import CourseQuizModal from './components/CourseQuizModal';
import AvatarGuide from './components/AvatarGuide';
import { apiUrl } from './config/api';

const QUICK_TOPICS = [
  '⚡ React 19 & Next.js',
  '🦀 Rust Systems',
  '🤖 PyTorch ML',
  '🔒 Ethical Hacking',
  '☁️ DevOps & AWS',
  '📊 Data Science',
  '🎨 UI/UX & Figma',
];

const PASTEL_CLASSES = [
  'pastel-yellow',
  'pastel-blue',
  'pastel-green',
  'pastel-purple',
  'pastel-orange',
  'pastel-rose'
];

export default function App() {
  // --- Authentication State ---
  const [token, setToken] = useState(() => {
    return localStorage.getItem('auth_token') || '';
  });
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');

  // --- UI & Application State ---
  const [history, setHistory] = useState([]);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [completedNodes, setCompletedNodes] = useState({});
  const [navStack, setNavStack] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [toast, setToast] = useState(null);
  
  const [dynamicPresets, setDynamicPresets] = useState([]);
  const [curatedRoadmaps, setCuratedRoadmaps] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [loadingCurated, setLoadingCurated] = useState(false);
  
  // Evaluation Quiz State
  const [activeQuizData, setActiveQuizData] = useState(null);
  const [activeQuizRoadmap, setActiveQuizRoadmap] = useState(null);

  // Bootstrap Auth Session
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(apiUrl('/api/auth/me'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Session expired');
        }

        setUser({
          id: data.id,
          username: data.username,
          hasCompletedOnboarding: data.hasCompletedOnboarding ?? true,
          userCategory: data.userCategory || '',
          curatedKeywords: data.curatedKeywords || [],
          initialInterests: data.initialInterests || [],
          interestTree: data.interestTree || []
        });
        setApiKey(data.geminiApiKey || '');
      } catch (err) {
        console.error('Session restore failed:', err.message);
        handleLogout();
      }
    };

    fetchProfile();
  }, [token]);

  // Fetch saved roadmaps when logged in
  useEffect(() => {
    if (!token || !user) return;

    const fetchRoadmaps = async () => {
      try {
        const response = await fetch(apiUrl('/api/roadmaps'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          const rootRoadmaps = data.filter(r => !r.isSubRoadmap);
          setHistory(rootRoadmaps);
        }
      } catch (err) {
        console.error('Failed to load user roadmaps:', err);
      }
    };

    fetchRoadmaps();
  }, [token, user]);

  // Synchronize Node completions based on the active nav stack roadmaps
  useEffect(() => {
    const dict = {};
    navStack.forEach(item => {
      if (item.data && item.data.completedNodes) {
        Object.keys(item.data.completedNodes).forEach(key => {
          if (item.data.completedNodes[key]) {
            dict[key] = true;
          }
        });
      }
    });
    setCompletedNodes(dict);
  }, [navStack]);

  // Fetch curated roadmaps based on static domains
  useEffect(() => {
    if (!token || !user || !user.hasCompletedOnboarding || curatedRoadmaps.length > 0) return;

    const fetchCurated = async () => {
      setLoadingCurated(true);
      try {
        const keywordsParam = (user.curatedKeywords || []).join(',');
        const response = await fetch(apiUrl(`/api/roadmaps/curated?keywords=${encodeURIComponent(keywordsParam)}`), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setCuratedRoadmaps(data);
        }
      } catch (err) {
        console.error('Failed to load curated roadmaps:', err);
      } finally {
        setLoadingCurated(false);
      }
    };

    fetchCurated();
  }, [token, user, curatedRoadmaps.length]);

  // Fetch dynamic AI presets based on dynamic interestTree
  useEffect(() => {
    if (!token || !user || !user.hasCompletedOnboarding || dynamicPresets.length > 0 || !user.interestTree.length) return;

    const fetchPresets = async () => {
      setLoadingPresets(true);
      try {
        const response = await fetch(apiUrl('/api/generate/presets'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ interestTree: user.interestTree })
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setDynamicPresets(data);
        }
      } catch (err) {
        console.error('Failed to load dynamic presets:', err);
      } finally {
        setLoadingPresets(false);
      }
    };

    fetchPresets();
  }, [token, user, dynamicPresets.length]);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Auth Handlers ---
  const handleLoginSuccess = (authToken, userData) => {
    localStorage.setItem('auth_token', authToken);
    setToken(authToken);
    setUser({
      id: userData.id,
      username: userData.username,
      hasCompletedOnboarding: userData.hasCompletedOnboarding ?? false,
      userCategory: userData.userCategory || '',
      curatedKeywords: userData.curatedKeywords || [],
      initialInterests: userData.initialInterests || [],
      interestTree: userData.interestTree || []
    });
    triggerToast(`Welcome back, ${userData.username}!`);
  };

  const handleOnboardingComplete = (updatedUser) => {
    setUser(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      userCategory: updatedUser.userCategory || prev.userCategory,
      curatedKeywords: updatedUser.curatedKeywords || prev.curatedKeywords,
      initialInterests: updatedUser.initialInterests || prev.initialInterests,
      interestTree: updatedUser.interestTree || prev.interestTree
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken('');
    setUser(null);
    setApiKey('');
    setHistory([]);
    setCompletedNodes({});
    setNavStack([]);
    setSelectedNode(null);
    setResourcesCache({});
    setDynamicPresets([]);
    setCuratedRoadmaps([]);
    triggerToast('Logged out of your space.', 'error');
  };

  const handleSaveApiKey = async (newKey) => {
    try {
      const response = await fetch(apiUrl('/api/auth/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ geminiApiKey: newKey })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to update key');

      setApiKey(newKey);
      if (newKey) {
        triggerToast('Gemini API key saved in MongoDB. Live AI Active!');
      } else {
        triggerToast('API key removed. Running in Offline Demo Mode.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Failed to save key.', 'error');
    }
  };

  const handleStartNew = () => {
    setNavStack([]);
    setSelectedNode(null);
    setInputText('');
  };

  const handleSelectHistoryItem = (item) => {
    setNavStack([{
      id: item._id,
      title: item.title,
      data: item
    }]);
    setSelectedNode(null);
  };

  const getRoadmapProgress = (roadmap) => {
    if (!roadmap) return { completed: 0, total: 0, percent: 0 };
    const nodes = Array.isArray(roadmap.phases)
      ? roadmap.phases.flatMap(p => p.nodes || [])
      : (Array.isArray(roadmap.nodes) ? roadmap.nodes : []);
    const total = nodes.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };
    let done = 0;
    const compMap = roadmap.completedNodes || {};
    nodes.forEach(n => {
      const isDone = n.completed || (compMap instanceof Map ? compMap.get(n.id) : compMap[n.id]);
      if (isDone) done++;
    });
    return { completed: done, total, percent: Math.round((done / total) * 100) };
  };

  const handleDeleteHistoryItem = async (e, itemId) => {
    e.stopPropagation();
    const itemToDelete = history.find(item => item._id === itemId);
    const title = itemToDelete ? itemToDelete.title : 'this roadmap';
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(apiUrl(`/api/roadmaps/${itemId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to delete roadmap');

      setHistory(prev => prev.filter(item => item._id !== itemId));
      
      if (navStack.length > 0 && navStack[0].id === itemId) {
        setNavStack([]);
      }
      triggerToast('Roadmap deleted successfully.');
    } catch (err) {
      console.error(err);
      triggerToast(err.message, 'error');
    }
  };

  const handleToggleNodeCompleted = async (nodeId) => {
    if (navStack.length === 0) return;
    const activeRoadmap = navStack[navStack.length - 1];
    const isCurrentlyCompleted = !!completedNodes[nodeId];

    try {
      const response = await fetch(apiUrl(`/api/roadmaps/${activeRoadmap.id}/complete`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nodeId, completed: !isCurrentlyCompleted })
      });
      const updated = await response.json();

      if (!response.ok) throw new Error(updated.error || 'Failed to toggle status');

      setCompletedNodes(prev => ({
        ...prev,
        [nodeId]: !isCurrentlyCompleted
      }));

      setNavStack(prev => prev.map(item => 
        item.id === activeRoadmap.id ? { ...item, data: updated } : item
      ));

      setHistory(prev => prev.map(item => 
        item._id === activeRoadmap.id ? updated : item
      ));

    } catch (err) {
      console.error(err);
      triggerToast(err.message, 'error');
    }
  };

  const handleCreateRoadmap = async (topic) => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setLoadingText(`Synthesizing roadmaps for "${topic}"...`);
    
    try {
      const genResponse = await fetch(apiUrl('/api/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });
      const genData = await genResponse.json();
      if (!genResponse.ok) throw new Error(genData.error || 'AI synthesis failed');

      const saveResponse = await fetch(apiUrl('/api/roadmaps'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: genData.title || topic,
          description: genData.description || '',
          phases: genData.phases
        })
      });
      const savedRoadmap = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(savedRoadmap.error || 'Failed to save roadmap');
      
      setHistory(prev => [savedRoadmap, ...prev]);
      setNavStack([{
        id: savedRoadmap._id,
        title: savedRoadmap.title,
        data: savedRoadmap
      }]);
      setInputText('');
      triggerToast(`Roadmap for "${topic}" generated!`);
    } catch (err) {
      console.error(err);
      triggerToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSubRoadmap = async (node) => {
    const parentNav = navStack[navStack.length - 1];
    const parentTopic = parentNav.title;
    const subTopic = node.title;
    
    setIsLoading(true);
    setLoadingText(`Drilling down into "${subTopic}"...`);
    setSelectedNode(null); 
    
    try {
      const genResponse = await fetch(apiUrl('/api/generate/sub'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ parentTopic, subTopic, nodeId: node.id })
      });
      const genData = await genResponse.json();
      if (!genResponse.ok) throw new Error(genData.error || 'Sub-roadmap generation failed');

      const saveResponse = await fetch(apiUrl('/api/roadmaps'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: genData.title || subTopic,
          description: genData.description || '',
          phases: genData.phases,
          isSubRoadmap: true,
          parentNodeId: node.id
        })
      });
      const savedSub = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(savedSub.error || 'Failed to save sub-roadmap');

      setNavStack(prev => [
        ...prev,
        {
          id: savedSub._id,
          title: subTopic,
          data: savedSub
        }
      ]);
      triggerToast(`Sub-roadmap for "${subTopic}" loaded!`);
    } catch (err) {
      console.error(err);
      triggerToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCourseQuiz = async (roadmap) => {
    setIsLoading(true);
    setLoadingText(`Building 10-Question Evaluation Test for "${roadmap.title}"...`);
    try {
      const response = await fetch(apiUrl('/api/generate/course-quiz'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roadmapId: roadmap._id })
      });
      const quizData = await response.json();
      if (!response.ok) throw new Error(quizData.error || 'Failed to load evaluation quiz');

      setActiveQuizData(quizData);
      setActiveQuizRoadmap(roadmap);
    } catch (err) {
      console.error(err);
      triggerToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCourseQuiz = async (quizId, userAnswers) => {
    const response = await fetch(apiUrl('/api/generate/evaluate-quiz'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quizId, userAnswers })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to evaluate quiz');
    return result;
  };

  const handleRedesignCourse = async (roadmapTitle, weakTopics) => {
    setIsLoading(true);
    setLoadingText(`Synthesizing Remedial Roadmap for weak areas (${weakTopics.join(', ')})...`);
    try {
      const response = await fetch(apiUrl('/api/generate/redesign-course'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roadmapTitle, weakTopics })
      });
      const savedRemedial = await response.json();
      if (!response.ok) throw new Error(savedRemedial.error || 'Failed to create remedial course');

      setHistory(prev => [savedRemedial, ...prev]);
      setNavStack([{
        id: savedRemedial._id,
        title: savedRemedial.title,
        data: savedRemedial
      }]);
      triggerToast(`Remedial Roadmap for "${roadmapTitle}" created!`);
    } catch (err) {
      console.error(err);
      triggerToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToBreadcrumb = (index) => {
    setNavStack(prev => prev.slice(0, index + 1));
    setSelectedNode(null);
  };

  const currentView = navStack[navStack.length - 1];

  if (!token || !user) {
    return (
      <div className="app-container">
        <div className="cosmic-bg">
          <div className="stars"></div>
        </div>
        <AuthPortal onLoginSuccess={handleLoginSuccess} />
        {toast && (
          <div className="toast-container">
            <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
              <div className="toast-message">{toast.message}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (user && !user.hasCompletedOnboarding) {
    return (
      <div className="app-container">
        <div className="cosmic-bg">
          <div className="stars"></div>
        </div>
        <OnboardingQuiz 
          token={token} 
          onComplete={handleOnboardingComplete} 
          onLogout={handleLogout}
          onSaveKey={handleSaveApiKey}
        />
        {toast && (
          <div className="toast-container">
            <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
              <div className="toast-message">{toast.message}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const primaryInterest = user.curatedKeywords && user.curatedKeywords.length > 0 
    ? user.curatedKeywords[0] 
    : 'Your Interests';

  return (
    <div className="app-container">
      <div className="cosmic-bg">
        <div className="stars"></div>
      </div>

      <aside className="sidebar">
        <div className="sidebar-header" onClick={handleStartNew} style={{ cursor: 'pointer' }}>
          <Sparkles size={24} className="preset-icon" style={{ color: 'var(--color-ink)', marginBottom: 0 }} />
          <h1 className="logo-text">Cosmic Roadmap</h1>
        </div>

        <div className="sidebar-content">
          <button 
            className="btn btn-primary" 
            onClick={handleStartNew}
            style={{ width: '100%', marginBottom: '24px' }}
          >
            <Plus size={18} />
            New Roadmap
          </button>

          <h3 className="nav-section-title">Saved Paths ({history.length})</h3>
          {history.length > 2 && (
            <div className="sidebar-search">
              <Search size={14} style={{ color: 'var(--color-ink-muted)' }} />
              <input
                type="text"
                className="sidebar-search-input"
                placeholder="Search paths..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-ink-muted)' }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {history.length === 0 ? (
            <p style={{ fontSize: '1.1rem', color: 'var(--color-ink-muted)', paddingLeft: '8px' }}>
              No roadmaps saved yet. Create one to begin your journey!
            </p>
          ) : (
            <div>
              {history
                .filter(item => !sidebarSearch.trim() || item.title?.toLowerCase().includes(sidebarSearch.toLowerCase().trim()))
                .map((item) => {
                  const isActive = navStack.length > 0 && navStack[0].id === item._id;
                  const progress = getRoadmapProgress(item);
                  return (
                    <div 
                      key={item._id} 
                      className={`history-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectHistoryItem(item)}
                    >
                      <span className="history-item-title">{item.title}</span>
                      {progress.total > 0 && (
                        <span className={`history-progress-badge ${progress.percent === 100 ? 'done' : ''}`} title={`${progress.completed} of ${progress.total} topics completed`}>
                          {progress.percent}%
                        </span>
                      )}
                      <button 
                        className="history-item-delete"
                        onClick={(e) => handleDeleteHistoryItem(e, item._id)}
                        title="Delete roadmap"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'var(--note-yellow)',
              border: '2px solid var(--color-ink)',
              borderRadius: '12px 6px 10px 4px/4px 10px 6px 12px',
              boxShadow: '2px 2px 0px var(--color-ink)',
              padding: '10px 14px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>Mode</span>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: apiKey ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {apiKey ? 'Live AI' : 'Demo Mode'}
              </span>
            </div>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => setIsSettingsOpen(true)}
              style={{ width: '32px', height: '32px' }}
              title="Open Settings"
            >
              <Settings size={16} />
            </button>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '4px 8px',
              fontSize: '1.1rem' 
            }}
          >
            <span style={{ fontWeight: 'bold', color: 'var(--color-ink)' }} title={user.username}>
              @ {user.username}
            </span>
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-error)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-body)',
                fontWeight: 'bold'
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="header">
          {navStack.length > 0 ? (
            <div className="breadcrumbs">
              <span className="breadcrumb-item" onClick={handleStartNew}>Dashboard</span>
              {navStack.map((nav, index) => {
                const isLast = index === navStack.length - 1;
                return (
                  <React.Fragment key={nav.id}>
                    <ChevronRight size={14} className="breadcrumb-separator" />
                    <span 
                      className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                      onClick={() => !isLast && handleNavigateToBreadcrumb(index)}
                    >
                      {nav.title}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-title)' }}>
              Welcome, {user.username}
            </div>
          )}

          <div>
            <button className="btn btn-secondary" onClick={() => setIsSettingsOpen(true)}>
              <Cpu size={16} />
              Settings
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">{loadingText}</p>
          </div>
        ) : currentView ? (
          <RoadmapView 
            roadmap={currentView.data}
            completedNodes={completedNodes}
            onNodeClick={(node) => {
              setSelectedNode(node);
            }}
            onToggleCompleted={handleToggleNodeCompleted}
            onStartCourseQuiz={handleStartCourseQuiz}
          />
        ) : (
          <div className="welcome-container" style={{ display: 'flex', gap: '40px', textAlign: 'left', maxWidth: '1100px' }}>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
              {/* Cosmo Assistant Banner on Dashboard */}
              <div style={{ marginBottom: '28px' }}>
                <AvatarGuide 
                  message={
                    isLoading 
                      ? "Cosmo is synthesizing your structured multi-phase curriculum with embedded study resources... ✨"
                      : `Welcome back, ${user.username}! Type what skill or technology you want to learn below, or pick an interactive track!`
                  }
                  emotion={isLoading ? 'thinking' : 'happy'}
                />
              </div>

              <div className="personalized-header" style={{ marginBottom: '24px' }}>
                <h2 className="welcome-title" style={{ fontSize: '2.8rem', marginBottom: '8px' }}>
                  What would you like to master? 🌌
                </h2>
                <p className="welcome-subtitle" style={{ margin: 0 }}>
                  Plot your next learning adventure. Generate a structured, multi-phase curriculum of milestones and study resources.
                </p>
              </div>

              <form 
                className="gen-form"
                style={{ margin: '0 0 16px 0', maxWidth: '100%', position: 'relative' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateRoadmap(inputText);
                }}
              >
                <input 
                  type="text" 
                  className="gen-input" 
                  placeholder="What do you want to learn? (e.g. Master Rust, Next.js 15, Machine Learning)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  required
                />
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center' }}
                    title="Clear input"
                  >
                    <X size={18} />
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  <Sparkles size={18} />
                  Generate Path
                </button>
              </form>

              {/* Quick Inspiration Chips */}
              <div className="gen-chips" style={{ margin: '0 0 36px 0', justifyContent: 'flex-start' }}>
                {QUICK_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    className="gen-chip"
                    onClick={() => setInputText(topic.replace(/^[^\w]+/, ''))}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* SECTION 1: Curated by Experts */}
              <div style={{ marginBottom: '40px' }}>
                <h3 className="nav-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.25rem' }}>
                  <Compass size={20} color="var(--color-primary)" />
                  Trending in {primaryInterest} (Curated by Experts)
                </h3>
                {loadingCurated ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                     <span>Fetching curated roadmaps...</span>
                   </div>
                ) : (
                  <div className="presets-grid">
                    {curatedRoadmaps.map((r, idx) => {
                      const pastelClass = PASTEL_CLASSES[idx % PASTEL_CLASSES.length];
                      const rot = (idx % 2 === 0 ? '-0.8deg' : '0.8deg');
                      return (
                        <div 
                          key={idx} 
                          className={`preset-card ${pastelClass}`} 
                          onClick={() => handleCreateRoadmap(r.title)}
                          style={{ transform: `rotate(${rot})` }}
                        >
                          <span style={{ fontSize: '2rem' }}>{r.icon}</span>
                          <div className="preset-title" style={{ marginTop: '8px' }}>{r.title}</div>
                          <div className="preset-desc">{r.desc}</div>
                          <div className="preset-action-hint">
                            <span>Draw Path</span>
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 2: AI Tailored for You */}
              <div style={{ marginBottom: '40px' }}>
                <h3 className="nav-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.25rem' }}>
                  <Brain size={20} color="var(--color-success)" />
                  AI Personalized Journeys (Tailored for You)
                </h3>
                {loadingPresets ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                    <span>Generating your personalized cosmic journeys...</span>
                  </div>
                ) : (
                  <div className="presets-grid">
                    {dynamicPresets.map((presetTitle, idx) => {
                      const pastelClass = PASTEL_CLASSES[(idx + 2) % PASTEL_CLASSES.length];
                      const rot = (idx % 2 === 0 ? '0.8deg' : '-0.8deg');
                      return (
                        <div 
                          key={idx} 
                          className={`preset-card ${pastelClass}`} 
                          onClick={() => handleCreateRoadmap(presetTitle)}
                          style={{ transform: `rotate(${rot})` }}
                        >
                          <span style={{ fontSize: '2rem' }}>✨</span>
                          <div className="preset-title" style={{ marginTop: '8px' }}>{presetTitle}</div>
                          <div className="preset-desc">A highly specialized cosmic journey mapped for your unique AI deep-dive.</div>
                          <div className="preset-action-hint">
                            <span>Draw Path</span>
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
            </div>

            <div style={{ width: '300px', flexShrink: 0, border: '2px dashed var(--color-ink-muted)', borderRadius: '16px', overflow: 'hidden', height: '500px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px', background: 'var(--note-blue)', borderBottom: '2px solid var(--color-ink-muted)', fontWeight: 'bold', textAlign: 'center' }}>
                Your Profile Tree
              </div>
              <div style={{ flex: 1, background: 'var(--bg-paper)' }}>
                {user.userCategory ? (
                  <InterestTreeVis 
                    userCategory={user.userCategory}
                    initialInterests={user.initialInterests}
                    aiTreePath={user.interestTree} 
                  />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
                    Complete onboarding to see your cosmic tree!
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}

        <NodeDrawer 
          node={selectedNode}
          completed={selectedNode ? !!completedNodes[selectedNode.id] : false}
          resources={selectedNode && selectedNode.resources ? selectedNode.resources : []}
          onClose={() => setSelectedNode(null)}
          onGenerateSubRoadmap={handleGenerateSubRoadmap}
          onToggleCompleted={handleToggleNodeCompleted}
        />

        {activeQuizData && (
          <CourseQuizModal 
            quizData={activeQuizData}
            roadmapTitle={activeQuizRoadmap ? activeQuizRoadmap.title : 'Roadmap'}
            onClose={() => {
              setActiveQuizData(null);
              setActiveQuizRoadmap(null);
            }}
            onSubmitQuiz={handleSubmitCourseQuiz}
            onRedesignCourse={handleRedesignCourse}
          />
        )}

        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          onSaveKey={handleSaveApiKey}
        />

        {toast && (
          <div className="toast-container">
            <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
              <div className="toast-message">{toast.message}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
