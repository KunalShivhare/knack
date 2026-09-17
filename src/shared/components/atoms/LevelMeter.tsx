import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export type LevelMeterProps = {
  /** 1-based. Every bar up to and including this one is filled. */
  level: number;
  total: number;
  style?: ViewStyle;
};

const BAR_WIDTH = 6;
const BAR_STEP = 5;

/**
 * Rising bars filled up to a level — the signal-strength shape, so "how far
 * along" reads before the label does. Drawn with views rather than a glyph
 * because no icon comes in ascending steps, and views take the theme's colours.
 */
export function LevelMeter({ level, total, style }: LevelMeterProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Level ${level} of ${total}`}
      style={[styles.root, style]}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            { height: BAR_STEP * (index + 2) },
            index < level ? styles.filled : null,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  bar: { width: BAR_WIDTH, borderRadius: radius.pill, backgroundColor: colors.border.default },
  // `brand.strong`, not the marigold fill: the bars sit on the selected tile's tint.
  filled: { backgroundColor: colors.brand.strong },
});
