import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { storage, storageKeys } from '@/shared/lib/storage';

import type { OnboardingAnswers } from '../types';
import {
  initialState,
  onboardingReducer,
  type OnboardingState,
  type PersistedOnboarding,
} from './reducer';

type OnboardingContextValue = OnboardingState & {
  answer: (patch: Partial<OnboardingAnswers>) => void;
  complete: () => void;
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/**
 * Holds the onboarding answers and mirrors them to storage.
 *
 * A reducer and context rather than a state library: the whole store is one
 * typed transition function over six fields, and a dependency would add a
 * concept without removing any code.
 */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  useEffect(() => {
    let active = true;

    storage.get<PersistedOnboarding>(storageKeys.onboarding).then((persisted) => {
      // Guards against a state update after unmount in fast-refresh and in tests.
      if (active) dispatch({ type: 'hydrated', persisted });
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Writing before hydration would overwrite a saved run with the empty defaults.
    if (!state.hydrated) return;

    void storage.set<PersistedOnboarding>(storageKeys.onboarding, {
      answers: state.answers,
      completed: state.completed,
    });
  }, [state.answers, state.completed, state.hydrated]);

  const answer = useCallback((patch: Partial<OnboardingAnswers>) => {
    dispatch({ type: 'answer', patch });
  }, []);

  const complete = useCallback(() => dispatch({ type: 'complete' }), []);

  const reset = useCallback(() => {
    void storage.remove(storageKeys.onboarding);
    dispatch({ type: 'reset' });
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ ...state, answer, complete, reset }),
    [state, answer, complete, reset],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const value = useContext(OnboardingContext);

  if (!value) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  }

  return value;
}
