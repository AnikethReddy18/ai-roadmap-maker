import React from 'react';
import { Clock, CheckCircle2, Award, Circle } from 'lucide-react';

export default function RoadmapView({ roadmap, completedNodes, onNodeClick, onStartCourseQuiz }) {
  if (!roadmap) return null;

  const { title, description, phases = [] } = roadmap;

  // Track global index of nodes to alternate left and right positions consistently
  let globalNodeIndex = 0;

  // Calculate overall progress stats
  const allNodes = phases.flatMap(p => p.nodes || []);
  const totalNodesCount = allNodes.length;
  const completedCount = allNodes.filter(n => completedNodes[n.id]).length;
  const progressPercentage = totalNodesCount > 0 
    ? Math.round((completedCount / totalNodesCount) * 100) 
    : 0;

  // Pastel sticky note color rotation
  const pastelColors = [
    'var(--note-yellow)',
    'var(--note-blue)',
    'var(--note-purple)',
    'var(--note-orange)',
    'var(--note-rose)'
  ];

  return (
    <div className="roadmap-container">
      {/* Roadmap Info Header */}
      <div className="roadmap-header">
        <h2 className="roadmap-title">{title}</h2>
        <p className="roadmap-desc">{description}</p>
        
        {/* Progress Tracker bar */}
        {totalNodesCount > 0 && (
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px', fontSize: '1.15rem', fontWeight: 'bold' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Progress Tracker</span>
              <span style={{ color: progressPercentage === 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                {completedCount} / {totalNodesCount} Skills ({progressPercentage}%)
              </span>
            </div>
            
            {/* Sketchy outer bar */}
            <div 
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                height: '14px', 
                background: 'var(--bg-paper)', 
                borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                border: '2px solid var(--color-ink)',
                boxShadow: '2px 2px 0px var(--color-ink)',
                overflow: 'hidden',
                padding: '1px'
              }}
            >
              {/* Shaded inner bar */}
              <div 
                style={{ 
                  width: `${progressPercentage}%`, 
                  height: '100%', 
                  background: progressPercentage === 100 
                    ? 'var(--color-success)' 
                    : 'var(--color-primary)',
                  borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                  transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Timeline Area */}
      <div className="timeline-wrapper">
        {/* Central glowing vertical track */}
        <div className="timeline-line"></div>

        {phases.map((phase, phaseIdx) => (
          <div key={phase.id || `phase-${phaseIdx}`} className="timeline-phase">
            {/* Central Badge for the Phase */}
            <div className="phase-header-capsule">
              <div className="phase-badge">
                <span className="phase-title">{phase.title}</span>
                {phase.description && <p className="phase-desc">{phase.description}</p>}
              </div>
            </div>

            {/* Alternating Nodes list */}
            <div className="phase-nodes">
              {(phase.nodes || []).map((node, nodeIdx) => {
                const isLeft = globalNodeIndex % 2 === 0;
                
                // Deterministic angle rotation so cards don't jump on reload/state change
                const rotationAngle = ((globalNodeIndex * 7) % 3) - 1.2;
                
                // Color mapping: turns marker green when complete, cycles pastels otherwise
                const isCompleted = !!completedNodes[node.id];
                const cardBackground = isCompleted 
                  ? 'var(--note-green)' 
                  : pastelColors[globalNodeIndex % pastelColors.length];

                globalNodeIndex++;

                return (
                  <div 
                    key={node.id || `node-${nodeIdx}`} 
                    className={`node-row ${isLeft ? 'node-row-left' : 'node-row-right'}`}
                  >
                    {/* Glowing timeline dot node anchor */}
                    <div className="node-dot"></div>
                    
                    {/* Branch link line */}
                    <div className="node-connector"></div>

                    {/* Interactive Node Card */}
                    <div 
                      className={`node-card ${isCompleted ? 'completed' : ''}`}
                      onClick={() => onNodeClick(node)}
                      style={{ 
                        transform: `rotate(${rotationAngle}deg)`,
                        backgroundColor: cardBackground
                      }}
                    >
                      <div className="node-card-header">
                        <h4 className="node-card-title">{node.title}</h4>
                      </div>
                      
                      <p className="node-card-desc">{node.description}</p>
                      
                      <div className="node-card-meta">
                        {node.estimatedTime && (
                          <span className="node-card-time">
                            <Clock size={14} />
                            {node.estimatedTime}
                          </span>
                        )}
                        <span className="node-card-status">
                          {isCompleted ? (
                            <>
                              <CheckCircle2 size={16} />
                              Completed!
                            </>
                          ) : (
                            <>
                              <Circle size={16} style={{ strokeWidth: 2 }} />
                              Mark Complete
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* End Badge (Index Card look) */}
      {progressPercentage === 100 && totalNodesCount > 0 && (
        <div 
          style={{ 
            marginTop: '50px', 
            padding: '30px', 
            background: 'var(--note-green)', 
            border: '2px solid var(--color-ink)', 
            borderRadius: '12px 16px 14px 18px / 18px 14px 16px 12px', 
            textAlign: 'center', 
            maxWidth: '500px',
            boxShadow: '6px 6px 0px var(--color-ink)',
            animation: 'slideInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2)'
          }}
        >
          <Award size={48} style={{ color: 'var(--color-ink)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Path Completed!</h3>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-ink-muted)', marginBottom: '20px' }}>
            Amazing! You've checked off every topic on this path. Take the final evaluation test to measure your mastery!
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => onStartCourseQuiz(roadmap)}
            style={{ fontSize: '1.15rem', padding: '12px 24px' }}
          >
            <Award size={20} />
            Take 10-Q Evaluation Quiz
          </button>
        </div>
      )}
    </div>
  );
}
