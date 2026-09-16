import { forwardRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, textVariants } from '@/theme';

import { Text } from './Text';

export type InputProps = Omit<TextInputProps, 'style'> & {
  /** Message shown under the field. Also switches the border to the error tone. */
  error?: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
};

/**
 * Owns focus and error styling so no screen has to reimplement a focus ring. The
 * border is the only thing that moves — the field itself never resizes, which
 * would otherwise shift the layout every time the keyboard opens.
 *
 * Every field centres its text and caret: the screens around them are centred
 * compositions, and a lone left-aligned value pulls the layout off axis. The one
 * multiline answer is a sentence or two, short enough to stay readable centred.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { error, style, containerStyle, multiline, placeholder, value, onBlur, onFocus, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  // A centred caret laid over a centred placeholder cuts through the middle of
  // it. Once focused, the caret alone says "type here".
  const showPlaceholder = !(focused && !value);

  const borderColor = error
    ? colors.status.error
    : focused
      ? colors.border.focus
      : colors.border.default;

  return (
    <View style={containerStyle}>
      <TextInput
        ref={ref}
        // Android only: a single-line EditText scrolls sideways, and when it is
        // empty React Native scrolls just far enough to reveal the caret, which
        // parks a centred field's caret against the right edge. A multiline one
        // does not scroll, so it centres; Enter still submits instead of
        // breaking the line.
        multiline={multiline || Platform.OS === 'android'}
        submitBehavior={multiline ? undefined : 'blurAndSubmit'}
        value={value}
        placeholder={showPlaceholder ? placeholder : undefined}
        placeholderTextColor={colors.text.tertiary}
        cursorColor={colors.text.primary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.field,
          multiline ? styles.multiline : styles.singleLine,
          { borderColor },
          focused ? styles.focused : null,
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color="primary" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    ...textVariants.subheading,
    color: colors.text.primary,
    backgroundColor: colors.surface.default,
    borderWidth: 1.5,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 62,
    textAlign: 'center',
  },
  singleLine: { textAlignVertical: 'center' },
  multiline: {
    minHeight: 120,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  // Web draws its own focus ring on top of ours; native ignores the property.
  focused: { outlineWidth: 0 },
  error: {
    color: colors.status.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
