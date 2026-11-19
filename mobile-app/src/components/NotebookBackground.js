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
        {showMargin && (
          <Line x1={28} y1={0} x2={28} y2="100%" stroke={colors.marginLine} strokeWidth={1.5} />
        )}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
  },
});
