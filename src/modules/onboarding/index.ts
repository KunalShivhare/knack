/**
 * The onboarding module's public surface. Routes in `src/app` import from here
 * and never reach deeper, so the module's internals can move without touching
 * the router.
 */
export { HOBBY_DRIFT, HOBBY_SUGGESTIONS, LEVELS, TIME_BUDGETS } from './constants';
export { HobbyDrift, HobbyPicker, OptionTile } from './components/molecules';
export { OnboardingShell } from './components/organisms';
export { OnboardingProvider, useOnboarding } from './state';
export {
  ONBOARDING_STEPS,
  emptyAnswers,
  firstIncompleteStep,
  stepIsComplete,
} from './types';

export type { LevelOption } from './constants';
export type { LevelId, OnboardingAnswers, OnboardingStep, TimeBudgetId } from './types';
