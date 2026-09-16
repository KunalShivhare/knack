import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

export type OptionTileProps = {
  label: string;
  /** The line that makes the difference between two options concrete. */
  description: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * A full-width choice with a supporting line. A `Chip` would fit the label but
 * not the description, and on the level question the descriptions are what make
 * "Dabbled a bit" and "Comfortable" mean different things.
 */
export function OptionTile({ label, description, selected, onPress }: OptionTileProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        selected ? styles.selected : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.copy}>
        <Text variant="bodyStrong" color="primary">
          {label}
        </Text>
        <Text variant="caption" color="secondary">
          {description}
        </Text>
      </View>
      <View style={[styles.mark, selected ? styles.markOn : null]}>
        {selected ? (
          <Text variant="caption" color="inverse">
            ✓
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.default,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  // Stays white: filling a full-width row black would swamp the screen and
  // spend the 10% on a choice rather than on the CTA. The border and the filled
  // tick carry the state instead.
  selected: { backgroundColor: colors.surface.default, borderColor: colors.brand.default },
  pressed: { transform: [{ scale: 0.99 }] },
  copy: { flex: 1, gap: spacing.xxs },
  mark: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOn: { backgroundColor: colors.brand.pressed, borderColor: colors.brand.pressed },
});
