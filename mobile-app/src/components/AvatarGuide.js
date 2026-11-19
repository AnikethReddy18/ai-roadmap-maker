import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const EMOTION_CONFIG = {
  default: {
    bg: colors.noteBlue,
    border: colors.primary,
    icon: 'robot-outline',
    shadow: colors.primary,
    emoji: '🤖',
  },
  happy: {
    bg: colors.noteGreen,
    border: colors.success,
    icon: 'star-shooting-outline',
    shadow: colors.success,
    emoji: '✨',
  },
  excited: {
    bg: colors.noteYellow,
    border: colors.warning,
    icon: 'lightning-bolt',
    shadow: colors.warning,
    emoji: '⚡',
  },
  thinking: {
    bg: colors.notePurple,
    border: colors.accentPurple,
    icon: 'brain',
    shadow: colors.accentPurple,
    emoji: '🧠',
  },
};

const FUN_QUIPS = [
  "Break down big topics into 30-minute study sprints! ⏱️",
  "Consistency beats intensity: one step a day builds mastery! 🚀",
  "Tap 'Sub-Roadmap' on any topic to drill into detailed prerequisites! 🔍",
  "Once you reach 100%, test your skills with the Evaluation Quiz! 🏆",
  "Doodling and taking notes helps retention by 40%! 📝",
];

export default function AvatarGuide({ message, emotion = 'default', mood }) {
  const activeEmotion = mood || emotion || 'default';
  const config = EMOTION_CONFIG[activeEmotion] || EMOTION_CONFIG.default;

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [extraTip, setExtraTip] = useState(null);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Gentle float bounce on load/change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -4,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeEmotion, message, bounceAnim]);

  // Typing animation
  useEffect(() => {
    const textToType = extraTip || message || '';
    if (!textToType) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setDisplayedText(textToType.slice(0, idx));
      if (idx >= textToType.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [message, extraTip]);

  // Blinking cursor
  useEffect(() => {
    if (!isTyping) return;
    const blinkInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 400);
    return () => clearInterval(blinkInterval);
  }, [isTyping]);

  const handleTapAvatar = () => {
    const randomQuip = FUN_QUIPS[Math.floor(Math.random() * FUN_QUIPS.length)];
    setExtraTip(randomQuip);
    setTimeout(() => {
      setExtraTip(null);
    }, 6000);
  };

  return (
    <View style={styles.wrapper}>
      {/* Avatar Circle with Emotion Badge */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleTapAvatar}
        style={styles.avatarButton}
      >
        <Animated.View
          style={[
            styles.avatarCircle,
            {
              backgroundColor: config.bg,
              borderColor: config.border,
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name={config.icon}
            size={24}
            color={config.border}
          />
          <View style={styles.emotionBadge}>
            <Text style={styles.emotionEmoji}>{config.emoji}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Speech Chat Bubble */}
      <View style={[styles.chatBubble, { borderColor: config.border }]}>
        <Text style={styles.bubbleText}>
          {displayedText}
          {isTyping && cursorVisible && <Text style={styles.cursor}>|</Text>}
        </Text>

        {/* Bubble pointer tail */}
        <View style={[styles.bubbleTail, { borderRightColor: config.border }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 2,
  },
  avatarButton: {
    marginRight: 10,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    position: 'relative',
  },
  emotionBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionEmoji: {
    fontSize: 11,
  },
  chatBubble: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    position: 'relative',
    minHeight: 46,
    justifyContent: 'center',
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 18,
  },
  cursor: {
    color: colors.primary,
    fontWeight: '900',
  },
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: 15,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 6,
    borderRightWidth: 8,
    borderBottomWidth: 6,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});
