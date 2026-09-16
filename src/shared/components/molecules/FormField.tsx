import { forwardRef } from 'react';
import { StyleSheet, View, type TextInput, type ViewStyle } from 'react-native';

import { Input, Text, type InputProps } from '@/shared/components/atoms';
import { spacing } from '@/theme';

export type FormFieldProps = InputProps & {
  /** Sits above the field. Omit on a screen where the heading already asks the question. */
  label?: string;
  /** Sits below the label, for the detail the question itself should not carry. */
  hint?: string;
  fieldStyle?: ViewStyle;
};

/** A labelled input. Keeps label, hint and error spacing identical on every screen. */
export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, hint, fieldStyle, ...inputProps },
  ref,
) {
  return (
    <View style={fieldStyle}>
      {label ? (
        <Text variant="label" color="tertiary" align="center" style={styles.label}>
          {label}
        </Text>
      ) : null}
      {hint ? (
        <Text variant="caption" color="secondary" align="center" style={styles.hint}>
          {hint}
        </Text>
      ) : null}
      <Input ref={ref} {...inputProps} />
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: spacing.xs },
  hint: { marginBottom: spacing.sm },
});
