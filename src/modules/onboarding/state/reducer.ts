import { emptyAnswers, type OnboardingAnswers } from '../types';

export type OnboardingState = {
  answers: OnboardingAnswers;
  /** True once the user has finished the last step. */
  completed: boolean;
  /** False until storage has been read, so nothing renders against a guess. */
  hydrated: boolean;
};

/** The subset written to storage. `hydrated` is runtime-only by definition. */
export type PersistedOnboarding = Pick<OnboardingState, 'answers' | 'completed'>;

export type OnboardingAction =
  | { type: 'hydrated'; persisted: PersistedOnboarding | null }
  | { type: 'answer'; patch: Partial<OnboardingAnswers> }
  | { type: 'complete' }
  | { type: 'reset' };

export const initialState: OnboardingState = {
  answers: emptyAnswers,
  completed: false,
  hydrated: false,
};

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case 'hydrated':
      return {
        // A missing or unreadable record starts a fresh run rather than failing.
        answers: { ...emptyAnswers, ...action.persisted?.answers },
        completed: action.persisted?.completed ?? false,
        hydrated: true,
      };

    case 'answer':
      return { ...state, answers: { ...state.answers, ...action.patch } };

    case 'complete':
      return { ...state, completed: true };

    case 'reset':
      // Keeps `hydrated`: storage has still been read, there is just nothing in it.
      return { ...initialState, hydrated: state.hydrated };

    default:
      return state;
  }
}
