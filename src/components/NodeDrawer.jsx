import React from 'react';
import { 
  X, 
  Clock, 
  CheckCircle, 
  Circle, 
  Sparkles, 
  ExternalLink,
  Play,
  BookOpen,
  FileText,
  GraduationCap,
  Terminal,
  Link as LinkIcon
} from 'lucide-react';

export default function NodeDrawer({ 
  node, 
  completed, 
  resources = [], 
  onClose, 
  onGenerateSubRoadmap, 
  onToggleCompleted 
}) {
  const isOpen = !!node;
  const displayResources = (node && node.resources && node.resources.length > 0) 
    ? node.resources 
    : (resources || []);

  // Map resource types to Lucide icons
  const getResourceIcon = (type = '') => {
    const cleanType = type.toLowerCase();
    if (cleanType.includes('video')) return <Play size={16} />;
    if (cleanType.includes('book')) return <BookOpen size={16} />;
    if (cleanType.includes('documentation') || cleanType.includes('docs')) return <FileText size={16} />;
    if (cleanType.includes('article')) return <FileText size={16} />;
    if (cleanType.includes('tutorial')) return <GraduationCap size={16} />;
    if (cleanType.includes('interactive') || cleanType.includes('playground')) return <Terminal size={16} />;
    return <LinkIcon size={16} />;
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      {/* Slide-over legal notepad panel */}
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        {node && (
          <>
            <div className="drawer-header">
              <h3 className="drawer-title">{node.title}</h3>
              <button className="drawer-close" onClick={onClose} aria-label="Close details">
                <X size={22} />
              </button>
            </div>

            <div className="drawer-content">
              <p className="drawer-desc">{node.description}</p>

              {/* Meta information items */}
              <div className="drawer-meta-list">
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Est. Time</div>
                  <div className="drawer-meta-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                    {node.estimatedTime || 'N/A'}
                  </div>
                </div>

                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Status</div>
                  <div 
                    className="drawer-meta-value" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      color: completed ? 'var(--color-success)' : 'var(--color-ink-muted)'
                    }}
                  >
                    {completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                    {completed ? 'Completed!' : 'Not Started'}
                  </div>
                </div>
              </div>

              {/* Core Drawer Actions */}
              <div className="drawer-actions">
                <button 
                  className={`btn ${completed ? 'btn-secondary' : 'btn-primary'}`} 
                  onClick={() => onToggleCompleted(node.id)}
                  style={{ 
                    background: completed ? 'var(--note-rose)' : 'var(--note-green)',
                    color: 'var(--color-ink)'
                  }}
                >
                  {completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                </button>

                <button 
                  className="btn btn-primary" 
                  onClick={() => onGenerateSubRoadmap(node)}
                >
                  <Sparkles size={18} />
                  Generate Sub-Roadmap
                </button>
              </div>

              {/* Study Resources Section */}
              <div className="resources-section">
                <h4 className="resources-title">
                  <BookOpen size={20} style={{ color: 'var(--color-ink)' }} />
                  Study Guides & Links
                </h4>

                {displayResources.length === 0 ? (
                  <p style={{ fontSize: '1.1rem', color: 'var(--color-ink-muted)' }}>
                    No resource cards found. Try looking up tutorials on the web.
                  </p>
                ) : (
                  <div className="resource-list">
                    {displayResources.map((res, idx) => (
                      <a 
                        key={idx} 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="resource-card"
                      >
                        <div className="resource-icon-wrapper">
                          {getResourceIcon(res.type)}
                        </div>
                        <div className="resource-info">
                          <div className="resource-name" title={res.title}>
                            {res.title}
                          </div>
                          <div className="resource-meta">
                            {res.platform || 'Documentation'} • {res.type}
                          </div>
                        </div>
                        <ExternalLink size={14} style={{ color: 'var(--color-ink-muted)', flexShrink: 0 }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
