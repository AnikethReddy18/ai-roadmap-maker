import React, { useState } from 'react';
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
  Copy,
  Check
} from 'lucide-react';

export default function NodeDrawer({ 
  node, 
  completed, 
  resources = [], 
  onClose, 
  onGenerateSubRoadmap, 
  onToggleCompleted 
}) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const isOpen = !!node;
  const displayResources = (node && node.resources && node.resources.length > 0) 
    ? node.resources 
    : (resources || []);

  // Map resource types to Lucide icons and pastel colors
  const getResourceMeta = (type = '', platform = '') => {
    const cleanType = (type + ' ' + platform).toLowerCase();
    if (cleanType.includes('video') || cleanType.includes('youtube')) {
      return { icon: <Play size={16} />, bg: 'var(--note-rose)', color: 'var(--color-error)', label: 'Video' };
    }
    if (cleanType.includes('doc') || cleanType.includes('official') || cleanType.includes('mdn') || cleanType.includes('api')) {
      return { icon: <FileText size={16} />, bg: 'var(--note-blue)', color: 'var(--color-primary)', label: 'Docs' };
    }
    if (cleanType.includes('tutorial') || cleanType.includes('course') || cleanType.includes('guide')) {
      return { icon: <GraduationCap size={16} />, bg: 'var(--note-green)', color: 'var(--color-success)', label: 'Tutorial' };
    }
    if (cleanType.includes('interactive') || cleanType.includes('playground') || cleanType.includes('github') || cleanType.includes('code')) {
      return { icon: <Terminal size={16} />, bg: 'var(--note-purple)', color: '#8b5cf6', label: 'Interactive' };
    }
    return { icon: <BookOpen size={16} />, bg: 'var(--note-yellow)', color: 'var(--color-warning)', label: 'Article' };
  };

  const handleCopyLink = (e, url, idx) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
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
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Study Worksheet
                </span>
                <h3 className="drawer-title" style={{ marginTop: '2px' }}>{node.title}</h3>
              </div>
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
                    {node.estimatedTime || node.estimatedHours ? `${node.estimatedTime || node.estimatedHours + ' hrs'}` : '1-2 hrs'}
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
                  {completed ? (
                    <>
                      <Circle size={16} />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Mark Completed
                    </>
                  )}
                </button>

                <button 
                  className="btn btn-primary" 
                  onClick={() => onGenerateSubRoadmap(node)}
                >
                  <Sparkles size={18} />
                  Sub-Roadmap
                </button>
              </div>

              {/* Study Resources Section */}
              <div className="resources-section">
                <h4 className="resources-title">
                  <BookOpen size={20} style={{ color: 'var(--color-ink)' }} />
                  Curated Study Guides & Links
                </h4>

                {displayResources.length === 0 ? (
                  <p style={{ fontSize: '1.1rem', color: 'var(--color-ink-muted)' }}>
                    No resource cards embedded for this step yet.
                  </p>
                ) : (
                  <div className="resource-list">
                    {displayResources.map((res, idx) => {
                      const meta = getResourceMeta(res.type, res.platform);
                      return (
                        <div 
                          key={idx} 
                          className="resource-card"
                          style={{ position: 'relative' }}
                        >
                          <a
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ display: 'flex', alignItems: 'center', flex: 1, textDecoration: 'none', color: 'inherit' }}
                          >
                            <div 
                              className="resource-icon-wrapper" 
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {meta.icon}
                            </div>
                            <div className="resource-info">
                              <div className="resource-name" title={res.title}>
                                {res.title}
                              </div>
                              <div className="resource-meta">
                                {res.platform || meta.label} • {res.type || 'Guide'}
                              </div>
                            </div>
                          </a>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                            <button
                              onClick={(e) => handleCopyLink(e, res.url, idx)}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              title="Copy URL"
                            >
                              {copiedIdx === idx ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                            </button>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open link in new tab"
                              style={{ color: 'var(--color-ink-muted)', display: 'inline-flex' }}
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
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
