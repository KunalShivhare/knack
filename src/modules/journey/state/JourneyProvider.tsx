import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import type { LearnerProfile, PlanMeta, StrikeReason, Technique, TechniqueImage } from '@/shared/contracts';
import { storage, storageKeys } from '@/shared/lib/storage';

import type { Journey, TechniqueStatus } from '../types';
import {
  createJourney,
  initialState,
  journeyReducer,
  type PersistedJourneys,
} from './reducer';

type JourneyContextValue = {
  hydrated: boolean;
  /** The journey on screen, or `null` before a plan has been made. */
  journey: Journey | null;
  create: (plan: { profile: LearnerProfile; meta: PlanMeta; techniques: Technique[] }) => void;
  setStatus: (techniqueId: string, status: TechniqueStatus, reason?: StrikeReason) => void;
  swap: (techniqueId: string, replacement: Technique) => void;
  logPractice: (techniqueId: string, minutes: number) => void;
  setImage: (techniqueId: string, image: TechniqueImage | null) => void;
  /** Steps away from the active journey so a new plan can be made. The old one stays stored. */
  leave: () => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

const now = () => new Date().toISOString();

/** Holds the learner's journeys and mirrors them to storage, as onboarding does. */
export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(journeyReducer, initialState);

  useEffect(() => {
    let active = true;

    storage.get<PersistedJourneys>(storageKeys.journeys).then((persisted) => {
      if (active) dispatch({ type: 'hydrated', persisted });
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Writing before hydration would overwrite saved progress with an empty list.
    if (!state.hydrated) return;

    void storage.set<PersistedJourneys>(storageKeys.journeys, {
      journeys: state.journeys,
      activeId: state.activeId,
    });
  }, [state.journeys, state.activeId, state.hydrated]);

  const create = useCallback<JourneyContextValue['create']>((plan) => {
    const createdAt = now();
    dispatch({
      type: 'created',
      journey: createJourney({ id: `journey-${Date.now().toString(36)}`, createdAt, ...plan }),
    });
  }, []);

  const setStatus = useCallback<JourneyContextValue['setStatus']>((techniqueId, status, reason) => {
    dispatch({ type: 'statusChanged', techniqueId, status, reason, at: now() });
  }, []);

  const swap = useCallback<JourneyContextValue['swap']>((techniqueId, replacement) => {
    dispatch({ type: 'swapped', techniqueId, replacement, at: now() });
  }, []);

  const logPractice = useCallback<JourneyContextValue['logPractice']>((techniqueId, minutes) => {
    dispatch({ type: 'practiceLogged', techniqueId, minutes, at: now() });
  }, []);

  const setImage = useCallback<JourneyContextValue['setImage']>((techniqueId, image) => {
    dispatch({ type: 'imageFound', techniqueId, image });
  }, []);

  const leave = useCallback(() => dispatch({ type: 'left' }), []);

  const journey = useMemo(
    () => state.journeys.find((item) => item.id === state.activeId) ?? null,
    [state.journeys, state.activeId],
  );

  const value = useMemo<JourneyContextValue>(
    () => ({
      hydrated: state.hydrated,
      journey,
      create,
      setStatus,
      swap,
      logPractice,
      setImage,
      leave,
    }),
    [state.hydrated, journey, create, setStatus, swap, logPractice, setImage, leave],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney(): JourneyContextValue {
  const value = useContext(JourneyContext);

  if (!value) {
    throw new Error('useJourney must be used inside <JourneyProvider>');
  }

  return value;
}
