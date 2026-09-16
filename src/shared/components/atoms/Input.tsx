import { forwardRef, useState } from 'react';
import {
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
 * Single-line fields centre their text: the screens around them are centred
 * compositions, and a lone left-aligned value pulls the whole layout off axis.
 * Multiline answers stay left — centred prose is unreadable past one line.
 */

/**
 * Owns focus and error styling so no screen has to reimplement a focus ring. The
 * border is the only thing that moves — the field itself never resizes, which
 * would otherwise shift the layout every time the keyboard opens.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { error, style, containerStyle, multiline, onBlur, onFocus, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.status.error
    : focused
      ? colors.border.focus
      : colors.border.default;

  return (
    <View style={containerStyle}>
      <TextInput
        ref={ref}
        multiline={multiline}
        placeholderTextColor={colors.text.tertiary}
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
          multiline ? styles.multiline : styles.centred,
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
  },
  centred: { textAlign: 'center' },
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
