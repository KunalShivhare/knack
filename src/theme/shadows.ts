import { Platform, type ViewStyle } from 'react-native';

/** Near-black, matching the ramp. Shadows stay faint — on a monochrome canvas a
 * heavy shadow competes with the near-black accent for attention. */
const shadowColor = '#0A0A0A';

const build = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
): ViewStyle =>
  Platform.select({
    android: { elevation, shadowColor },
    default: {
      shadowColor,
      shadowOffset: { width: 0, height: offsetY },
      shadowRadius: blur,
      shadowOpacity: opacity,
    },
  }) as ViewStyle;

export const shadows = {
  none: {} as ViewStyle,
  sm: build(1, 2, 0.06, 1),
  md: build(2, 6, 0.08, 3),
  lg: build(6, 16, 0.1, 8),
} as const;

export type Shadows = typeof shadows;
