import React, { useState } from 'react';
import { Sparkles, User, Lock, LogIn, UserPlus, Key } from 'lucide-react';

export default function AuthPortal({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all details!');
      return;
    }

    if (!isLogin && !geminiApiKey.trim()) {
      setError('Gemini API Key is required for registration!');
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const body = isLogin 
        ? { username: username.trim(), password }
        : { username: username.trim(), password, geminiApiKey: geminiApiKey.trim() };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: '24px'
      }}
    >
      <div 
        className="modal" 
        style={{ 
          position: 'relative', 
          transform: 'none',
          maxWidth: '420px',
          width: '100%',
          borderRadius: '12px 16px 14px 18px / 18px 14px 16px 12px',
          background: 'var(--bg-paper)',
          boxShadow: '10px 10px 0px var(--color-ink)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div 
            style={{ 
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              background: 'var(--note-yellow)',
              border: '2px solid var(--color-ink)',
              color: 'var(--color-ink)',
              marginBottom: '14px'
            }}
          >
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>
            {isLogin ? 'Cosmic Sketchbook' : 'Join the Sketchbook'}
          </h2>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.1rem', marginTop: '4px' }}>
            {isLogin ? 'Sign in to map your learning journeys' : 'Register to start tracking your skills'}
          </p>
        </div>

        {error && (
          <div 
            style={{
              background: 'var(--note-rose)',
              border: '2px solid var(--color-ink)',
              borderRadius: '8px 10px 6px 12px/12px 6px 10px 8px',
              padding: '12px',
              marginBottom: '20px',
              color: 'var(--color-error)',
              fontSize: '1.05rem',
              fontWeight: 'bold',
              boxShadow: '3px 3px 0px var(--color-ink)'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Pencil sketcher name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '40px' }}
                disabled={isLoading}
              />
              <User 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-ink-muted)'
                }} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: !isLogin ? '14px' : '28px' }}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Secret key outline..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                disabled={isLoading}
              />
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-ink-muted)'
                }} 
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" htmlFor="geminiApiKey">
                Gemini API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="geminiApiKey"
                  type="password"
                  className="form-input"
                  placeholder="AI API Key required..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  disabled={isLoading}
                />
                <Key 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--color-ink-muted)'
                  }} 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '1.25rem', marginBottom: '20px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Register
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '2px dashed var(--color-ink-muted)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setUsername('');
              setPassword('');
              setGeminiApiKey('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '1.1rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            disabled={isLoading}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
