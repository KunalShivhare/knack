/*
 * Contract values the app needs at runtime. Kept apart from the zod schemas so
 * importing an id list does not pull a validation library into the app bundle.
 */

export const LEVEL_IDS = ['new', 'dabbled', 'comfortable', 'sharp'] as const;
export const TIME_BUDGET_IDS = ['light', 'steady', 'serious', 'deep'] as const;
export const MEDIUMS = ['visual', 'reading', 'practice'] as const;
export const STRIKE_REASONS = ['too_hard', 'disliked'] as const;

export type LevelId = (typeof LEVEL_IDS)[number];
export type TimeBudgetId = (typeof TIME_BUDGET_IDS)[number];
export type Medium = (typeof MEDIUMS)[number];
export type StrikeReason = (typeof STRIKE_REASONS)[number];

/**
 * How many techniques a plan holds, set by the weekly time budget. Decided in
 * code rather than left to the model: the budget is the lever against the
 * overload the app exists to prevent, and a model asked for "5 to 8" drifts to 8.
 * Shared so the app can lay out the plan before the first technique arrives.
 */
export const TECHNIQUE_COUNT: Record<TimeBudgetId, number> = {
  light: 5,
  steady: 6,
  serious: 7,
  deep: 8,
};
