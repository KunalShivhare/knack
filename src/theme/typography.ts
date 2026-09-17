import { Platform, type TextStyle } from 'react-native';

/**
 * Two families. Bricolage Grotesque — a grotesque with ink traps and a slightly
 * hand-cut feel — sets headings and figures; Figtree, an open geometric sans,
 * sets everything read at length. The root layout loads them under these keys.
 *
 * Android ignores `fontWeight` for a custom font, and iOS may fall back to the
 * system face when asked for a weight a family was not registered with. So each
 * weight is its own family here, and no variant sets `fontWeight`.
 */
export const fontFamily = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemibold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
} as const;

/**
 * Named text roles. Components pick a role rather than assembling a size and
 * line height each time, which is what keeps type consistent.
 */
export const textVariants = {
  /** The welcome wordmark. */
  hero: { fontFamily: fontFamily.display, fontSize: 44, lineHeight: 48, letterSpacing: -0.5 },
  display: { fontFamily: fontFamily.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.3 },
  /** Screen and question titles — the one thing the eye should land on first. */
  title: { fontFamily: fontFamily.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.2 },
  /** A lesson's title in its sheet. */
  heading: { fontFamily: fontFamily.displayBold, fontSize: 22, lineHeight: 28 },
  subheading: { fontFamily: fontFamily.body, fontSize: 17, lineHeight: 26 },
  /** Card titles, button labels, anything that carries weight at 17pt. */
  subheadingStrong: { fontFamily: fontFamily.bodySemibold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.bodySemibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fontFamily.bodyMedium, fontSize: 13, lineHeight: 18 },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  /** Counts and minutes. Tabular, so figures do not shift as they change. */
  stat: {
    fontFamily: fontFamily.display,
    fontSize: 40,
    lineHeight: 44,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

export const typography = { fontFamily, textVariants } as const;

export type Typography = typeof typography;
export type TextVariant = keyof typeof textVariants;
