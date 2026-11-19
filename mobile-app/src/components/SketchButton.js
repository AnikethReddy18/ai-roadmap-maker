import React, { useState } from 'react';
import {
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

export default function SketchButton({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'yellow':
        return {
          bg: colors.noteYellow,
          text: colors.ink,
        };
      case 'green':
        return {
          bg: colors.noteGreen,
          text: colors.ink,
        };
      case 'rose':
        return {
          bg: colors.noteRose,
          text: colors.ink,
        };
      case 'purple':
        return {
          bg: colors.notePurple,
          text: colors.ink,
        };
      case 'secondary':
        return {
          bg: colors.bgCard,
          text: colors.ink,
        };
      case 'danger':
        return {
          bg: colors.error,
          text: colors.white,
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          text: colors.white,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 13,
          borderRadius: 10,
        };
      case 'lg':
        return {
          paddingVertical: 15,
          paddingHorizontal: 20,
          fontSize: 16,
          borderRadius: 14,
        };
      case 'md':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 14,
          borderRadius: 12,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: variantStyle.bg,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.borderRadius,
          transform: (pressed || isPressed)
            ? [{ translateX: 2 }, { translateY: 2 }]
            : [{ translateX: 0 }, { translateY: 0 }],
          shadowOffset: (pressed || isPressed)
            ? { width: 1, height: 1 }
            : { width: 3, height: 3 },
          elevation: (pressed || isPressed) ? 1 : 4,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text}
          style={styles.spinner}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          {title ? (
            <Text
              style={[
                styles.buttonText,
                {
                  color: variantStyle.text,
                  fontSize: sizeStyle.fontSize,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            children
          )}
          {iconRight && <View style={styles.iconRightWrap}>{iconRight}</View>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderWidth: 2,
    borderColor: colors.ink,
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  iconWrap: {
    marginRight: 8,
  },
  iconRightWrap: {
    marginLeft: 8,
  },
  spinner: {
    marginVertical: 2,
  },
});
