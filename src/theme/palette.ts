/**
 * Raw colour values. Nothing outside the theme folder should import this file —
 * screens and components consume the semantic `colors` map instead, so a value
 * can be retuned in one place without a find-and-replace across the app.
 *
 * The app is monochrome: one neutral ramp, white to near-black, and nothing
 * else. With hue removed, hierarchy has to come from contrast and weight, which
 * is what keeps a dense screen calm.
 */

/**
 * The single ramp. Steps are named by lightness so a jump of 100 reads as a
 * predictable step, and pure white and true-black sit at the ends for the two
 * places that need maximum contrast.
 */
export const neutral = {
  0: '#FFFFFF',
  25: '#FCFCFC',
  50: '#F7F7F7',
  100: '#F0F0F0',
  150: '#E6E6E6',
  200: '#D9D9D9',
  300: '#C2C2C2',
  400: '#A3A3A3',
  500: '#8A8A8A',
  600: '#6B6B6B',
  700: '#4A4A4A',
  800: '#2B2B2B',
  900: '#1A1A1A',
  950: '#0A0A0A',
} as const;

export const common = {
  white: neutral[0],
  black: '#000000',
  transparent: 'transparent',
} as const;
