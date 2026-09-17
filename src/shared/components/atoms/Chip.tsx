import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './Text';

export type ChipProps = {
  label: string;
  /** Leading emoji, for chips that name a hobby: the emoji is the hobby's mark, not an interface icon. */
  emoji?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** Fills the width of its parent. Used where chips stack rather than wrap. */
  block?: boolean;
  style?: ViewStyle;
};

/** Selectable pill. The hobby grid, the level list and the time budget all use it. */
export function Chip({
  label,
  emoji,
  selected = false,
  disabled = false,
  onPress,
  block = false,
  style,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : null,
        block ? styles.block : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {emoji ? (
        <Text variant="body" style={styles.emoji}>
          {emoji}
        </Text>
      ) : null}
      {/* One weight in both states: a label that turns bold on selection grows,
          and in a wrapped group that reflows every row after it. */}
      <Text variant="bodyStrong" color={selected ? 'inverse' : 'primary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface.default,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  block: { alignSelf: 'stretch' },
  // Marigold with an ink label: the brand fill marking a choice, 9:1 for the label.
  selected: {
    backgroundColor: colors.brand.default,
    borderColor: colors.brand.edge,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.45 },
  emoji: { fontSize: 18, lineHeight: 22 },
});
