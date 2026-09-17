import type { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { Medium } from '@/shared/contracts';

/**
 * How each medium is named in the app. Verbs rather than nouns — "See" says
 * what to do next, "Infographic" only says what the thing is. Each has a Feather
 * glyph; its colours live in the theme as `colors.medium`.
 */
export const MEDIUM_DISPLAY: Record<Medium, { icon: ComponentProps<typeof Feather>['name']; label: string }> = {
  visual: { icon: 'eye', label: 'See' },
  reading: { icon: 'book-open', label: 'Read' },
  practice: { icon: 'target', label: 'Practice' },
};

/** Session lengths offered by "Log practice". Three taps' worth, not a time picker. */
export const PRACTICE_MINUTES = [10, 20, 30] as const;

/**
 * Which picture search a technique's "no picture" came from. Raised whenever the
 * search improves, so lessons that found nothing before look once more; a
 * picture already found is kept. Also sent with the lookup, so the CDN's cached
 * answers from an older search are not reused.
 */
export const PICTURE_SEARCH_VERSION = 2;
