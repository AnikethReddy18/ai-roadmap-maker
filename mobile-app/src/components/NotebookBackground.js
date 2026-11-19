import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, Line } from 'react-native-svg';
import { colors } from '../theme/colors';

/**
 * NotebookBackground provides the authentic graph-paper sketchbook canvas
 * matching the web application's .cosmic-bg effect.
 */
export default function NotebookBackground({ children, showMargin = true, style }) {
  return (
    <View style={[styles.container, style]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Defs>
          <Pattern id="sketchGrid" width={28} height={28} patternUnits="userSpaceOnUse">
            <Line x1={0} y1={0} x2={28} y2={0} stroke={colors.gridLine} strokeWidth={1} />
            <Line x1={0} y1={0} x2={0} y2={28} stroke={colors.gridLine} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#sketchGrid)" />
      </Svg>
      {showMargin && <View style={styles.marginLine} pointerEvents="none" />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
  },
  marginLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 28,
    width: 1.5,
    backgroundColor: colors.marginLine,
    zIndex: 0,
  },
});
