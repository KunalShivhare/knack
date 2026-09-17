import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Chip } from '@/shared/components/atoms';
import { haptics } from '@/shared/lib/haptics';
import { spacing } from '@/theme';

export type ChipOption = {
  /** Stored value. Stable across copy changes, so it is safe to persist. */
  id: string;
  label: string;
  emoji?: string;
};

export type ChipGroupProps = {
  options: readonly ChipOption[];
  /** `null` when nothing is chosen yet. */
  value: string | null;
  onChange: (id: string) => void;
  /** `wrap` flows chips into rows; `stack` gives each its own full-width row. */
  layout?: 'wrap' | 'stack';
  style?: ViewStyle;
};

/**
 * Single-select chips. Selecting is idempotent rather than toggling: on these
 * screens an empty answer blocks the CTA, so letting a second tap clear the
 * choice only ever loses the user progress.
 */
export function ChipGroup({
  options,
  value,
  onChange,
  layout = 'wrap',
  style,
}: ChipGroupProps) {
  return (
    <View style={[layout === 'wrap' ? styles.wrap : styles.stack, style]}>
      {options.map((option) => (
        <Chip
          key={option.id}
          label={option.label}
          emoji={option.emoji}
          selected={value === option.id}
          block={layout === 'stack'}
          onPress={() => {
            if (value !== option.id) haptics.select();
            onChange(option.id);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  stack: { gap: spacing.sm },
});
