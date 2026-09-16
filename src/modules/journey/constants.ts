import type { Medium } from '@/shared/contracts';

/**
 * How each medium is named in the app. Verbs rather than nouns — "See" says
 * what to do next, "Infographic" only says what the thing is.
 */
export const MEDIUM_DISPLAY: Record<Medium, { emoji: string; label: string }> = {
  visual: { emoji: '👀', label: 'See' },
  reading: { emoji: '📖', label: 'Read' },
  practice: { emoji: '🎯', label: 'Practice' },
};

/** Session lengths offered by "Log practice". Three taps' worth, not a time picker. */
export const PRACTICE_MINUTES = [10, 20, 30] as const;
