import { Platform, type ViewStyle } from 'react-native';

/** Warm-tinted shadows. A neutral black shadow reads grey against the canvas. */
const shadowColor = '#261412';

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
