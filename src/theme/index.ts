import { colors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

/**
 * The single source of design truth. There is no provider and no light/dark
 * switch by design: the app commits to one visual world, so the theme is a
 * plain frozen object that any module can import directly. Adding a second
 * theme later means introducing a context here and nowhere else.
 */
export const theme = { colors, spacing, radius, typography, shadows } as const;

export type Theme = typeof theme;

export { colors } from './colors';
export { radius } from './radius';
export { shadows } from './shadows';
export { spacing } from './spacing';
export { textVariants, typography } from './typography';
export type { Colors, MediaKind } from './colors';
export type { TextVariant } from './typography';
