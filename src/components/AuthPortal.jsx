import React, { useState } from 'react';
import { Sparkles, User, Lock, LogIn, UserPlus, Key, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function AuthPortal({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
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
    const endpoint = apiUrl(isLogin ? '/api/auth/login' : '/api/auth/register');

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
          maxWidth: '440px',
          width: '100%',
          borderRadius: '16px',
          background: 'var(--bg-paper)',
          border: '3px solid var(--color-ink)',
          boxShadow: '10px 10px 0px var(--color-ink)',
          padding: '28px'
        }}
      >
        {/* Notebook Cover Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div 
            style={{ 
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              background: 'var(--note-yellow)',
              border: '2px solid var(--color-ink)',
              color: 'var(--color-ink)',
              boxShadow: '3px 3px 0px var(--color-ink)',
              marginBottom: '12px'
            }}
          >
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', margin: 0 }}>
            Cosmic Sketchbook
          </h2>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.15rem', marginTop: '4px' }}>
            {isLogin ? 'Sign in to map your learning journeys' : 'Register to start tracking your skills'}
          </p>
        </div>

        {/* Notebook Tabs Switcher */}
        <div 
          style={{ 
            display: 'flex', 
            background: 'var(--bg-paper)', 
            border: '2px solid var(--color-ink)', 
            borderRadius: '12px', 
            padding: '3px',
            marginBottom: '20px',
            boxShadow: '2px 2px 0px var(--color-ink)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              background: isLogin ? 'var(--note-yellow)' : 'transparent',
              fontWeight: isLogin ? 'bold' : 'normal',
              color: 'var(--color-ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '1.1rem',
              boxShadow: isLogin ? '2px 2px 0px var(--color-ink)' : 'none',
              outline: isLogin ? '1.5px solid var(--color-ink)' : 'none'
            }}
          >
            <LogIn size={16} /> Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              background: !isLogin ? 'var(--note-yellow)' : 'transparent',
              fontWeight: !isLogin ? 'bold' : 'normal',
              color: 'var(--color-ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '1.1rem',
              boxShadow: !isLogin ? '2px 2px 0px var(--color-ink)' : 'none',
              outline: !isLogin ? '1.5px solid var(--color-ink)' : 'none'
            }}
          >
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        {error && (
          <div 
            style={{
              background: 'var(--note-rose)',
              border: '2px solid var(--color-ink)',
              borderRadius: '10px',
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
          {/* Username */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="username" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="e.g. alex_explorer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '40px' }}
                disabled={isLoading}
                required
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

          {/* Password with Show/Hide */}
          <div className="form-group" style={{ marginBottom: !isLogin ? '16px' : '24px' }}>
            <label className="form-label" htmlFor="password" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                disabled={isLoading}
                required
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ink-muted)',
                  cursor: 'pointer',
                  padding: 4
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Gemini API Key for Registration */}
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="geminiApiKey" style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                  Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                  title="Get free Gemini API Key from Google AI Studio"
                >
                  <HelpCircle size={14} />
                  Free Key Link
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="geminiApiKey"
                  type={showApiKey ? "text" : "password"}
                  className="form-input"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  disabled={isLoading}
                  required={!isLogin}
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
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-ink-muted)',
                    cursor: 'pointer',
                    padding: 4
                  }}
                  title={showApiKey ? "Hide key" : "Show key"}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '1.25rem', marginBottom: '16px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                Sign In to Sketchbook
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Start My Learning Journey
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '2px dashed var(--color-ink-muted)', paddingTop: '14px' }}>
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
              fontSize: '1.15rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            disabled={isLoading}
          >
            {isLogin ? "New to Cosmic Sketchbook? Sign up here →" : 'Already registered? Sign in here →'}
          </button>
        </div>
      </div>
    </div>
  );
}
