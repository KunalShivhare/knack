import { Platform, type ViewStyle } from 'react-native';

/** Warm brown at low opacity: a grey shadow on paper looks like dirt, not depth. */
const shadowColor = '#503214';
const shadowRgb = '80, 50, 20';

const build = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
): ViewStyle =>
  Platform.select({
    android: { elevation, shadowColor },
    // react-native-web deprecates the shadow* props; the same shadow as CSS.
    web: { boxShadow: `0px ${offsetY}px ${blur}px rgba(${shadowRgb}, ${opacity})` },
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
