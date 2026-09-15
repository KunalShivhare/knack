export const radius = {
  none: 0,
  sm: 6,
  /** Default for inputs, chips and small controls. */
  md: 8,
  /** Cards and primary buttons. */
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 9999,
} as const;

export type Radius = typeof radius;
