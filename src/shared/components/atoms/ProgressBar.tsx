import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

export type ProgressBarProps = {
  /** Number of steps the bar represents. */
  total: number;
  /** How many are complete, 1-based. `0` renders an empty track. */
  current: number;
  style?: ViewStyle;
};

const FILL_MS = 320;

/**
 * One continuous bar rather than separate segments.
 *
 * Segments answer "how many questions are left", but they also chop the top of
 * every screen into pieces and read as chrome. A single bar filling forward is
 * quieter and still says the same thing — this is the app's entire
 * gamification budget, so it should not be the loudest element on the screen.
 */
export function ProgressBar({ total, current, style }: ProgressBarProps) {
  const target = total > 0 ? Math.min(Math.max(current, 0), total) / total : 0;

  // Lazy state, not a ref: `interpolate` reads the value during render.
  const [progress] = useState(() => new Animated.Value(target));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: target,
      duration: FILL_MS,
      // Animating width, which the native driver cannot handle.
      useNativeDriver: false,
    }).start();
  }, [progress, target]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
      style={[styles.track, style]}
    >
      <Animated.View style={[styles.fill, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.progress.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.progress.fill,
  },
});
