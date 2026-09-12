import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function AvatarGuide({ message, emotion = 'happy' }) {
  const getEmotionIcon = () => {
    switch (emotion) {
      case 'thinking': return '🤔';
      case 'excited': return '🚀';
      case 'sad': return '🌧️';
      default: return '✨';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarBubble}>
        <Text style={styles.avatarEmoji}>{getEmotionIcon()}</Text>
      </View>
      <View style={styles.speechBubble}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12
  },
  avatarBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarEmoji: {
    fontSize: 22
  },
  speechBubble: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 3
  },
  messageText: {
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600'
  }
});
