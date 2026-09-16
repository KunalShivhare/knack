import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { colors, textVariants, type TextVariant } from '@/theme';

type TextColor = keyof typeof colors.text;

export type TextProps = RNTextProps & {
  /** Named role from the type scale. Callers pick a role, never a font size. */
  variant?: TextVariant;
  /** Semantic colour token, not a hex value. */
  color?: TextColor;
  align?: TextStyle['textAlign'];
};

/**
 * Every piece of type in the app goes through here. Taking a variant rather than
 * a size is what stops one-off font sizes accumulating across screens.
 */
export function Text({
  variant = 'body',
  color = 'primary',
  align,
  style,
  ...rest
}: TextProps) {
  const variantStyle: TextStyle = textVariants[variant];

  return (
    <RNText
      style={[variantStyle, { color: colors.text[color] }, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}
