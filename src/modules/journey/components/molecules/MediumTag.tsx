import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { Medium } from '@/shared/contracts';
import { Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

import { MEDIUM_DISPLAY } from '../../constants';

/**
 * Which way a technique is learned, as a coloured capsule. Shown on every
 * technique so the plan's mix is visible at a glance — in hue as well as in the
 * word, which is what lets a path of six read as "see, read, practise" before
 * any title is read.
 */
export function MediumTag({ medium }: { medium: Medium }) {
  const { icon, label } = MEDIUM_DISPLAY[medium];
  const tone = colors.medium[medium];

  return (
    <View style={[styles.tag, { backgroundColor: tone.bg }]}>
      <Feather aria-hidden name={icon} size={12} color={tone.fg} />
      <Text variant="caption" style={{ color: tone.fg }}>
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
    borderRadius: radius.pill,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
});
