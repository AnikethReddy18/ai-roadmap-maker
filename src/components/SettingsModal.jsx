import React, { useState, useEffect } from 'react';
import { X, Key, Info, ShieldCheck, Cpu } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setTempKey(apiKey || '');
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(tempKey.trim());
    onClose();
  };

  const handleClear = () => {
    setTempKey('');
    onSaveKey('');
  };

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Cpu size={24} className="preset-icon" style={{ marginBottom: 0 }} />
            AI & Model Settings
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="apiKeyInput">
              Gemini API Key
            </label>
            <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
              <input
                id="apiKeyInput"
                type={showKey ? 'text' : 'password'}
                className="form-input"
                placeholder={apiKey ? '••••••••••••••••••••••••' : 'Enter Gemini API Key...'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                style={{ paddingRight: '50px' }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  color: 'var(--color-ink-muted)',
                  cursor: 'pointer',
                  minWidth: 'auto',
                  boxShadow: 'none',
                  borderRadius: '0'
                }}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            <p className="form-help">
              <Key size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Don't have a key? Get a free API key at{' '}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>

          <div
            style={{
              background: 'var(--note-yellow)',
              border: '2px solid var(--color-ink)',
              borderRadius: '12px 6px 14px 4px/4px 14px 6px 12px',
              boxShadow: '3px 3px 0px var(--color-ink)',
              padding: '16px',
              marginBottom: '28px',
            }}
          >
            <h4
              style={{
                fontSize: '1.15rem',
                fontWeight: 'bold',
                marginBottom: '6px',
                color: tempKey ? 'var(--color-success)' : 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tempKey ? (
                <>
                  <ShieldCheck size={18} /> Live AI Mode Active
                </>
              ) : (
                <>
                  <Info size={18} /> Offline Demo Mode Active
                </>
              )}
            </h4>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-ink-muted)', lineHeight: 1.3 }}>
              {tempKey
                ? 'Roadmaps and sub-roadmaps will be generated dynamically in real-time using the Gemini 2.5 Flash model.'
                : 'No API key provided. The app will run offline using pre-built interactive roadmaps (e.g. Frontend Development, Machine Learning) and fallback generators.'}
            </p>
          </div>

          <div className="modal-actions">
            {apiKey && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClear}
                style={{ color: 'var(--color-error)', marginRight: 'auto' }}
              >
                Clear Key
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Config
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
