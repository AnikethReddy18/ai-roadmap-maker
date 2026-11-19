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

const FUN_QUIPS = [
  "Break down big topics into 30-minute study sprints! ⏱️",
  "Consistency beats intensity: one step a day builds mastery! 🚀",
  "Click 'Sub-Roadmap' on any topic in the drawer to drill into prerequisites! 🔍",
  "Once you reach 100%, test your skills with the Evaluation Quiz! 🏆",
  "Doodling and taking visual notes increases retention by 40%! 📝",
  "Curated tracks below are great starting blocks for new domains! 🌌"
];

export default function AvatarGuide({ message, emotion = 'default', mood }) {
  const activeEmotion = mood || emotion || 'default';
  const config = emotionConfig[activeEmotion] || emotionConfig.default;
  const IconComponent = config.icon;

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [extraTip, setExtraTip] = useState(null);

  // Typing animation — resets whenever message or extraTip changes
  useEffect(() => {
    const textToType = extraTip || message || '';
    if (!textToType) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(textToType.slice(0, i));
      if (i >= textToType.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [message, extraTip]);

  const handleTapAvatar = () => {
    const randomQuip = FUN_QUIPS[Math.floor(Math.random() * FUN_QUIPS.length)];
    setExtraTip(randomQuip);
    setTimeout(() => {
      setExtraTip(null);
    }, 6000);
  };

  return (
    <div className="avatar-guide-wrapper">
      {/* Chat Bubble */}
      <div 
        className="avatar-chat-bubble" 
        style={{ 
          borderColor: config.border,
          boxShadow: `3px 3px 0px var(--color-ink)`
        }}
      >
        <span className="avatar-bubble-text">
          {displayedText}
          {isTyping && <span className="avatar-cursor">|</span>}
        </span>
        {/* Bubble tail */}
        <div className="avatar-bubble-tail" style={{ borderTopColor: config.border }} />
      </div>

      {/* Avatar Circle (Clickable for quick tips) */}
      <div
        className="avatar-circle"
        onClick={handleTapAvatar}
        title="Click Cosmo for a study tip!"
        style={{
          background: config.bg,
          borderColor: config.border,
          boxShadow: `4px 4px 0px ${config.shadow}`,
          cursor: 'pointer',
          transition: 'transform 0.15s ease-in-out'
        }}
      >
        <IconComponent size={34} color={config.border} strokeWidth={1.8} />
        <span className="avatar-emotion-badge">{config.label}</span>
      </div>
    </div>
  );
}
