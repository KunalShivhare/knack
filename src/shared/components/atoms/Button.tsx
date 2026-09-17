import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, textVariants } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Stretches to the full width of the parent. Used for the screen CTA. */
  block?: boolean;
  style?: ViewStyle;
};

const fills: Record<ButtonVariant, { bg: string; border: string; edge: string; label: string }> = {
  primary: {
    bg: colors.action.primary,
    border: colors.action.primaryBorder,
    edge: colors.action.primaryEdge,
    label: colors.action.primaryLabel,
  },
  secondary: {
    bg: colors.action.secondary,
    border: colors.action.secondaryBorder,
    edge: colors.action.secondaryEdge,
    label: colors.action.secondaryLabel,
  },
  ghost: {
    bg: colors.common.transparent,
    border: colors.common.transparent,
    edge: colors.common.transparent,
    label: colors.text.secondary,
  },
};

const ENABLE_MS = 180;

/** How far the face stands above its edge, and so how far a press sinks it. */
const EDGE = 4;

/** Outer height, edge included. It never changes, so nothing around a button moves. */
const HEIGHT: Record<ButtonSize, number> = { md: 48, lg: 56 };

/**
 * The single press-feedback implementation in the app. A button stands on a
 * darker edge and sinks onto it when pressed, the way a physical key does, and a
 * disabled one sits already sunk and flat, which reads as unavailable without
 * needing a second cue.
 *
 * The enable transition is animated rather than swapped: on a form where the
 * button unlocks as the last field is filled, the fade is the feedback that the
 * answer was accepted.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  block = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  // Loading blocks presses but keeps the button's colour and edge: it means
  // "working on it", not "unavailable", and a greyed fill would also swallow the spinner.
  const inactive = disabled || loading;
  // Lazy state, not a ref: the value is read during render to build the
  // interpolations below, which a ref is not allowed to be.
  const [enabled] = useState(() => new Animated.Value(disabled ? 0 : 1));

  useEffect(() => {
    Animated.timing(enabled, {
      toValue: disabled ? 0 : 1,
      duration: ENABLE_MS,
      // Colour cannot be driven on the native thread.
      useNativeDriver: false,
    }).start();
  }, [enabled, disabled]);

  const fill = fills[variant];

  const backgroundColor = enabled.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.action.disabled, fill.bg],
  });

  const borderColor = enabled.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.action.disabled, fill.border],
  });

  const color = enabled.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.action.disabledLabel, fill.label],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={[styles.press, block ? styles.block : null, style]}
      {...rest}
    >
      {({ pressed }) => {
        const sunk = disabled || (pressed && !inactive);

        return (
          <Animated.View
            style={[
              styles.face,
              {
                minHeight: HEIGHT[size] - (sunk ? EDGE : 0),
                marginTop: sunk ? EDGE : 0,
                backgroundColor,
                borderColor,
              },
              {
                borderBottomWidth: sunk ? 1 : EDGE + 1,
                borderBottomColor: disabled ? colors.action.disabled : fill.edge,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={fill.label} size="small" />
            ) : (
              <Animated.Text numberOfLines={1} style={[styles.label, { color }]}>
                {label}
              </Animated.Text>
            )}
          </Animated.View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { alignSelf: 'flex-start' },
  block: { alignSelf: 'stretch' },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xxl,
  },
  label: { ...textVariants.subheadingStrong },
});
