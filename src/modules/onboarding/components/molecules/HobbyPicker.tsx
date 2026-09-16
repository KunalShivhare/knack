import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Input, Text } from '@/shared/components/atoms';
import { ChipGroup, type ChipOption } from '@/shared/components/molecules';
import { spacing } from '@/theme';

export type HobbyPickerProps = {
  suggestions: readonly ChipOption[];
  /** The hobby itself, free text. A chip simply writes its label into it. */
  value: string;
  onChange: (hobby: string) => void;
  /** The keyboard's return key. */
  onSubmitEditing?: () => void;
};

/**
 * Chips and a free-text field over one value. The chips are shortcuts that write
 * their label into the same string the field edits, so typing a hobby that is
 * not listed is a first-class path rather than a fallback — which the brief
 * requires, since the hobby could be anything.
 */
export function HobbyPicker({ suggestions, value, onChange, onSubmitEditing }: HobbyPickerProps) {
  const matched = suggestions.find(
    (option) => option.label.toLowerCase() === value.trim().toLowerCase(),
  );

  // What the field shows. A picked chip's label is not echoed into it: the chip
  // already shows the choice, and the same word in two places reads as two
  // answers. Seeded once, since nothing else edits the hobby while this is up.
  const [typed, setTyped] = useState(() => (matched ? '' : value));

  return (
    <View style={styles.root}>
      <ChipGroup
        options={suggestions}
        value={matched?.id ?? null}
        onChange={(id) => {
          const picked = suggestions.find((option) => option.id === id);
          if (!picked) return;
          setTyped('');
          onChange(picked.label);
        }}
      />

      <View style={styles.divider}>
        <Text variant="body" color="secondary">
          or name your own
        </Text>
      </View>

      <Input
        value={typed}
        onChangeText={(text) => {
          setTyped(text);
          onChange(text);
        }}
        onSubmitEditing={onSubmitEditing}
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
