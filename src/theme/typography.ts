import { Platform } from 'react-native';

/**
 * Font families resolve to the system stack until custom faces are registered
 * with expo-font under these exact keys.
 */
const systemSans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'system-ui',
}) as string;

const systemSerif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
}) as string;

export const fontFamily = {
  display: systemSerif,
  body: systemSans,
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
  hero: 40,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.65,
} as const;

/**
 * Named text roles. Components pick a role rather than assembling a size,
 * weight and line height each time, which is what keeps type consistent.
 */
export const textVariants = {
  hero: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.hero * lineHeight.tight),
  },
  display: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.display,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.display * lineHeight.tight),
  },
  /** The question at the top of a screen. Bold and large — it is the one thing
   * on the screen the eye should land on first. */
  title: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: Math.round(fontSize.xxxl * lineHeight.snug),
  },
  heading: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: Math.round(fontSize.xl * lineHeight.snug),
  },
  subheading: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.lg * lineHeight.normal),
  },
  /** Button labels and anything else that has to carry weight at 17pt. */
  subheadingStrong: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.lg * lineHeight.normal),
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.md * lineHeight.normal),
  },
  bodyStrong: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.md * lineHeight.normal),
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.sm * lineHeight.normal),
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.xs * lineHeight.normal),
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
} as const;

export const typography = { fontFamily, fontSize, fontWeight, lineHeight, textVariants } as const;

export type Typography = typeof typography;
export type TextVariant = keyof typeof textVariants;
