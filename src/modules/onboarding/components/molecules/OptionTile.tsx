import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/atoms';
import { haptics } from '@/shared/lib/haptics';
import { colors, radius, spacing } from '@/theme';

export type OptionTileProps = {
  label: string;
  /** The line that makes the difference between two options concrete. */
  description: string;
  selected: boolean;
  onPress: () => void;
  /** Sits before the copy — a visual cue that tells options apart at a glance. */
  leading?: ReactNode;
};

/**
 * A full-width choice with a supporting line. A `Chip` would fit the label but
 * not the description, and on the level question the descriptions are what make
 * "Dabbled a bit" and "Comfortable" mean different things — so both are set at
 * reading size rather than caption size.
 */
export function OptionTile({ label, description, selected, onPress, leading }: OptionTileProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        if (!selected) haptics.select();
        onPress();
      }}
      style={({ pressed }) => [
        styles.tile,
        selected ? styles.selected : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {leading}
      <View style={styles.copy}>
        <Text variant="subheadingStrong" color="primary">
          {label}
        </Text>
        <Text variant="body" color="secondary">
          {description}
        </Text>
      </View>
      {/* A radio dot, not a tick: it marks one choice among several, which is
          what a radio says and a tick does not. */}
      <View style={[styles.radio, selected ? styles.radioOn : null]}>
        {selected ? <View style={styles.dot} /> : null}
      </View>
    </Pressable>
  );
}

const RADIO = 24;

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface.default,
    // Two points in both states, so selecting a tile never shifts its contents.
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  // A tint and an ink outline: the choice reads at a glance without filling a
  // full-width row with the marigold the CTA below it needs.
  selected: { backgroundColor: colors.brand.tint, borderColor: colors.text.primary },
  pressed: { transform: [{ scale: 0.99 }] },
  copy: { flex: 1, gap: spacing.xxs },
  radio: {
    width: RADIO,
    height: RADIO,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.text.primary, borderWidth: 2 },
  dot: { width: 12, height: 12, borderRadius: radius.pill, backgroundColor: colors.text.primary },
});
