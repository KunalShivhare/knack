import { StyleSheet, View } from 'react-native';

import type { Medium } from '@/shared/contracts';
import { Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

import { MEDIUM_DISPLAY } from '../../constants';

/** Which way a technique is learned. Shown on every technique so the plan's mix is visible at a glance. */
export function MediumTag({ medium }: { medium: Medium }) {
  const { emoji, label } = MEDIUM_DISPLAY[medium];

  return (
    <View style={styles.tag}>
      <Text variant="caption" style={styles.emoji}>
        {emoji}
      </Text>
      <Text variant="caption" color="primary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.pill,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
  emoji: { fontSize: 12 },
});
