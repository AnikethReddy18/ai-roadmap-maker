import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Brain, Zap } from 'lucide-react';

const emotionConfig = {
  default: {
    bg: 'var(--note-blue)',
    border: 'var(--color-primary)',
    icon: Bot,
    shadow: '#3b82f6',
    label: '🤖'
  },
  happy: {
    bg: 'var(--note-green)',
    border: 'var(--color-success)',
    icon: Sparkles,
    shadow: '#10b981',
    label: '✨'
  },
  excited: {
    bg: 'var(--note-yellow)',
    border: 'var(--color-warning)',
    icon: Zap,
    shadow: '#f59e0b',
    label: '⚡'
  },
  thinking: {
    bg: 'var(--note-purple)',
    border: '#a855f7',
    icon: Brain,
    shadow: '#a855f7',
    label: '🧠'
  }
};

export default function AvatarGuide({ message, emotion = 'default' }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const config = emotionConfig[emotion] || emotionConfig.default;
  const IconComponent = config.icon;

  // Typing animation — resets whenever message changes
  useEffect(() => {
    if (!message) return;
    setDisplayedText('');
    setIsTyping(true);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="avatar-guide-wrapper">
      {/* Chat Bubble */}
      <div className="avatar-chat-bubble" style={{ borderColor: config.border }}>
        <span className="avatar-bubble-text">
          {displayedText}
          {isTyping && <span className="avatar-cursor">|</span>}
        </span>
        {/* Bubble tail */}
        <div className="avatar-bubble-tail" style={{ borderTopColor: config.border }} />
      </div>

      {/* Avatar Circle */}
      <div
        className="avatar-circle"
        style={{
          background: config.bg,
          borderColor: config.border,
          boxShadow: `4px 4px 0px ${config.shadow}`
        }}
      >
        <IconComponent size={36} color={config.border} strokeWidth={1.8} />
        <span className="avatar-emotion-badge">{config.label}</span>
      </div>
    </div>
  );
}
