import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function SketchBadge({
  label,
  children,
  bgColor = colors.noteYellow,
  textColor = colors.ink,
  borderColor = colors.ink,
  icon,
  style,
  textStyle,
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      {label ? (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {label}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  iconWrap: {
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
