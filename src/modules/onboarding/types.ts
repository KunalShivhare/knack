import type { LearnerProfile, LevelId, TimeBudgetId } from '@/shared/contracts';

/**
 * Stable ids, persisted, so they must not change when the copy does. Owned by the
 * plan contract because the server validates them too.
 */
export type { LevelId, TimeBudgetId };

/**
 * Everything onboarding collects. Each field exists because the plan prompt
 * consumes it — nothing is gathered here that the plan does not use.
 */
export type OnboardingAnswers = {
  name: string;
  /** Free text, not an id: the brief says the hobby could be anything. */
  hobby: string;
  level: LevelId | null;
  /** Phrased as an outcome ("play a full song"), not a level label. */
  target: string;
  motivation: string;
  weeklyHours: TimeBudgetId | null;
};

/** The routed question screens, in order. The welcome screen is not a step. */
export const ONBOARDING_STEPS = ['name', 'hobby', 'goal', 'motivation'] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const emptyAnswers: OnboardingAnswers = {
  name: '',
  hobby: '',
  level: null,
  target: '',
  motivation: '',
  weeklyHours: null,
};

/**
 * What each step needs before it will let the user move on. Kept here rather
 * than in the screens so that resume logic and CTA enablement can never
 * disagree about whether a step is done.
 */
export const stepIsComplete: Record<OnboardingStep, (a: OnboardingAnswers) => boolean> = {
  name: (a) => a.name.trim().length > 0,
  hobby: (a) => a.hobby.trim().length > 0,
  goal: (a) => a.level !== null && a.target.trim().length > 0,
  // Motivation is optional; the time budget is not, because it caps plan size.
  motivation: (a) => a.weeklyHours !== null,
};

/** The step to resume on: the first unanswered one, or `null` when all are done. */
export function firstIncompleteStep(answers: OnboardingAnswers): OnboardingStep | null {
  return ONBOARDING_STEPS.find((step) => !stepIsComplete[step](answers)) ?? null;
}

/**
 * The answers as the plan request needs them, or `null` while any required one
 * is missing. The name is left behind on the device: the plan has no use for
 * it, and free-tier prompts may be read to train models.
 */
export function toLearnerProfile(answers: OnboardingAnswers): LearnerProfile | null {
  const hobby = answers.hobby.trim();
  const target = answers.target.trim();

  if (!hobby || !target || !answers.level || !answers.weeklyHours) return null;

  return {
    hobby,
    level: answers.level,
    target,
    motivation: answers.motivation.trim(),
    weeklyHours: answers.weeklyHours,
  };
}
