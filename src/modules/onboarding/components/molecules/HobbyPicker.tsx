import { StyleSheet, View } from 'react-native';

import { Input, Text } from '@/shared/components/atoms';
import { ChipGroup, type ChipOption } from '@/shared/components/molecules';
import { spacing } from '@/theme';

export type HobbyPickerProps = {
  suggestions: readonly ChipOption[];
  /** The hobby itself, free text. A chip simply writes its label into it. */
  value: string;
  onChange: (hobby: string) => void;
};

/**
 * Chips and a free-text field over one value. The chips are shortcuts that write
 * their label into the same string the field edits, so typing a hobby that is
 * not listed is a first-class path rather than a fallback — which the brief
 * requires, since the hobby could be anything.
 */
export function HobbyPicker({ suggestions, value, onChange }: HobbyPickerProps) {
  const matched = suggestions.find(
    (option) => option.label.toLowerCase() === value.trim().toLowerCase(),
  );

  return (
    <View style={styles.root}>
      <ChipGroup
        options={suggestions}
        value={matched?.id ?? null}
        onChange={(id) => {
          const picked = suggestions.find((option) => option.id === id);
          if (picked) onChange(picked.label);
        }}
      />

      <View style={styles.divider}>
        <Text variant="caption" color="tertiary">
          or name your own
        </Text>
      </View>

      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Bread baking, bouldering, bass…"
        autoCapitalize="sentences"
        autoCorrect={false}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  divider: { alignItems: 'center', marginTop: spacing.xs },
});
