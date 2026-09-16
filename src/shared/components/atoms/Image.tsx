import { useState } from 'react';
import {
  Image as RNImage,
  StyleSheet,
  View,
  type ImageProps as RNImageProps,
  type ViewStyle,
} from 'react-native';

import { colors, radius as radiusTokens } from '@/theme';

export type ImageProps = Omit<RNImageProps, 'style'> & {
  /** Width comes from the layout; height follows from this. */
  aspectRatio?: number;
  radius?: keyof typeof radiusTokens;
  style?: ViewStyle;
};

/**
 * Reserves its box before the source resolves, so a slow image never shifts the
 * layout under the user. That, plus radius from a token, is the only reason this
 * wraps the built-in.
 */
export function Image({
  aspectRatio = 1,
  radius = 'lg',
  style,
  onLoadEnd,
  ...rest
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View
      style={[
        styles.frame,
        { aspectRatio, borderRadius: radiusTokens[radius] },
        loaded ? null : styles.placeholder,
        style,
      ]}
    >
      <RNImage
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        onLoadEnd={() => {
          setLoaded(true);
          onLoadEnd?.();
        }}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', width: '100%' },
  placeholder: { backgroundColor: colors.surface.muted },
});
