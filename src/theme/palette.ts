/**
 * Raw colour values. Nothing outside the theme folder should import this file —
 * screens and components consume the semantic `colors` map instead, so a value
 * can be retuned in one place without a find-and-replace across the app.
 *
 * Palette adapted from wondering.app (credited in the README). Every hue holds a
 * single HSL hue and saturation and moves only lightness, which is what keeps
 * tints and shades of the same colour looking related.
 */

/** Warm paper scale. Carries the notebook feel that separates this from a dashboard. */
export const base = {
  light: '#FFFCF0',
  50: '#F4F1E6',
  100: '#E7E3DA',
  200: '#D4CDC4',
  300: '#BDB5AD',
  500: '#938880',
  700: '#6B5752',
  800: '#52403D',
  900: '#3E2A28',
  dark: '#261412',
} as const;

/** Pure greys. Text and chrome only — surfaces use the warm scale above. */
export const gray = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#BFBFBF',
  400: '#B5B5B5',
  500: '#9E9E9E',
  600: '#6E6E6E',
  900: '#171717',
} as const;

export const blue = {
  50: '#F0F6FE',
  100: '#D8E6FD',
  400: '#3C83F6',
  500: '#1A6EF4',
  600: '#0B5CE0',
} as const;

/** Soft sky used for primary buttons — light fill, dark label. */
export const sky = {
  300: '#7ACEFF',
  600: '#497E9C',
} as const;

export const accent = {
  purple: '#7C3BED',
  purpleBg: '#F6F1FE',
  indigo: '#5048E5',
  indigoBg: '#F2F2FD',
  emerald: '#10B77F',
  emeraldBg: '#F1FEF9',
  cyan: '#07B9D5',
  cyanBg: '#F0FDFF',
  pink: '#EC4699',
  pinkBg: '#FEF1F7',
} as const;

export const status = {
  success: '#16A249',
  successBg: '#F2FDF6',
  warning: '#F97415',
  warningBg: '#FFF6F0',
  error: '#EF4343',
  errorBg: '#FEF1F1',
  info: '#169EF8',
  infoBg: '#F0F9FF',
} as const;

export const streak = {
  fire: '#FA9247',
  text: '#C75605',
  border: '#FFEADB',
  bg: '#FFF6F0',
} as const;

export const common = {
  white: '#FFFFFF',
  black: '#000000',
  highlight: '#FCEA45',
  transparent: 'transparent',
} as const;
