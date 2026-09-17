/**
 * Raw colour values. Nothing outside the theme folder should import this file —
 * screens and components consume the semantic `colors` map instead, so a value
 * can be retuned in one place without a find-and-replace across the app.
 *
 * "Sketchbook": warm paper, brown-black ink, and marigold as the one brand hue.
 * Every neutral leans warm, so the ground reads as paper rather than as a screen
 * switched off. The small tinted ramps give each lesson medium and each status a
 * colour of its own, always as a light fill paired with a dark ink of that hue.
 */

/** Grounds and hairlines, lightest first. */
export const paper = {
  0: '#FFFFFF',
  50: '#FFFAF0',
  100: '#F4EEE2',
  150: '#EFE7D9',
  200: '#E6DDCF',
} as const;

/** Text and strong strokes. Brown-black rather than black, to sit on paper. */
export const ink = {
  300: '#9C8B7C',
  500: '#7A6A5F',
  600: '#6E5F55',
  900: '#2A1F1A',
} as const;

/**
 * The brand hue. 400 is a fill and nothing else: at 1.7:1 on paper it cannot
 * carry text or a thin line, which is what 600 (rings) and 800 (text) are for.
 */
export const marigold = {
  50: '#FFF1D6',
  300: '#FFD58A',
  400: '#FFB83D',
  500: '#D9921C',
  600: '#B9780A',
  800: '#8A5300',
} as const;

export const green = { 50: '#DDF0E4', 700: '#2F7D57' } as const;
export const rust = { 50: '#F6E7D2', 700: '#9A5B13' } as const;
export const sky = { 50: '#D6ECFA', 800: '#1F5F8B' } as const;
export const lilac = { 50: '#E9E1F7', 800: '#5B3F99' } as const;
export const mint = { 50: '#D8F0E3', 800: '#1F6B45' } as const;

export const common = {
  white: paper[0],
  black: '#000000',
  transparent: 'transparent',
} as const;
