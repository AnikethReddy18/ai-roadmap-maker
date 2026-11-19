import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function SketchCard({
  children,
  style,
  bgColor = colors.bgCard,
  borderColor = colors.ink,
  rotation,
  onPress,
  disabled = false,
  shadowOffset = { width: 3, height: 3 },
}) {
  const containerStyle = [
    styles.card,
    {
      backgroundColor: bgColor,
      borderColor,
      shadowColor: colors.ink,
      shadowOffset,
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
      transform: rotation ? [{ rotate: `${rotation}deg` }] : undefined,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          containerStyle,
          pressed && {
            transform: [
              ...(rotation ? [{ rotate: `${rotation}deg` }] : []),
              { translateX: 2 },
              { translateY: 2 },
            ],
            shadowOffset: { width: 1, height: 1 },
            elevation: 2,
          },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 14,
  },
});
