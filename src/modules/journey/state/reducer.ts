import type { LearnerProfile, PlanMeta, StrikeReason, Technique, TechniqueImage } from '@/shared/contracts';

import type { Journey, JourneyTechnique, TechniqueStatus } from '../types';

export type JourneyState = {
  hydrated: boolean;
  journeys: Journey[];
  activeId: string | null;
};

export type PersistedJourneys = Pick<JourneyState, 'journeys' | 'activeId'>;

/**
 * Every action after `created` applies to the active journey. There is only ever
 * one on screen, so carrying a journey id through every call would be noise.
 * Times are passed in rather than read here, which keeps the reducer pure.
 */
export type JourneyAction =
  | { type: 'hydrated'; persisted: PersistedJourneys | null }
  | { type: 'created'; journey: Journey }
  | {
      type: 'statusChanged';
      techniqueId: string;
      status: TechniqueStatus;
      reason?: StrikeReason;
      at: string;
    }
  | { type: 'swapped'; techniqueId: string; replacement: Technique; at: string }
  | { type: 'practiceLogged'; techniqueId: string; minutes: number; at: string }
  | { type: 'imageFound'; techniqueId: string; image: TechniqueImage | null }
  | { type: 'left' };

export const initialState: JourneyState = { hydrated: false, journeys: [], activeId: null };

export function createJourney(input: {
  id: string;
  createdAt: string;
  profile: LearnerProfile;
  meta: PlanMeta;
  techniques: Technique[];
}): Journey {
  return {
    ...input,
    techniques: input.techniques.map(toEntry),
    practice: [],
  };
}

function toEntry(technique: Technique): JourneyTechnique {
  return {
    ...technique,
    status: 'todo',
    statusChangedAt: null,
    struckReason: null,
    replacedById: null,
  };
}

export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'hydrated':
      return {
        hydrated: true,
        journeys: action.persisted?.journeys ?? [],
        activeId: action.persisted?.activeId ?? null,
      };

    case 'created':
      return {
        ...state,
        journeys: [...state.journeys, action.journey],
        activeId: action.journey.id,
      };

    case 'statusChanged':
      return updateTechnique(state, action.techniqueId, (technique) => ({
        ...technique,
        status: action.status,
        statusChangedAt: action.at,
        struckReason: action.status === 'struck' ? (action.reason ?? null) : null,
        // Restoring a struck technique keeps its replacement, so the link goes.
        replacedById: action.status === 'struck' ? technique.replacedById : null,
      }));

    case 'swapped':
      return updateActive(state, (journey) => {
        const index = journey.techniques.findIndex((item) => item.id === action.techniqueId);
        if (index === -1) return journey;

        const taken = new Set(journey.techniques.map((item) => item.id));
        const replacement = { ...toEntry(action.replacement), id: uniqueId(action.replacement.id, taken) };
        const techniques = [...journey.techniques];

        techniques[index] = {
          ...techniques[index],
          status: 'struck',
          statusChangedAt: techniques[index].statusChangedAt ?? action.at,
          replacedById: replacement.id,
        };
        // Right after the one it replaces, so the path keeps its order of difficulty.
        techniques.splice(index + 1, 0, replacement);

        return { ...journey, techniques };
      });

    case 'practiceLogged':
      return updateActive(state, (journey) => ({
        ...journey,
        practice: [
          ...journey.practice,
          { techniqueId: action.techniqueId, minutes: action.minutes, loggedAt: action.at },
        ],
      }));

    case 'imageFound':
      return updateTechnique(state, action.techniqueId, (technique) => ({ ...technique, image: action.image }));

    case 'left':
      return { ...state, activeId: null };
  }
}

function updateActive(state: JourneyState, update: (journey: Journey) => Journey): JourneyState {
  return {
    ...state,
    journeys: state.journeys.map((journey) =>
      journey.id === state.activeId ? update(journey) : journey,
    ),
  };
}

function updateTechnique(
  state: JourneyState,
  techniqueId: string,
  update: (technique: JourneyTechnique) => JourneyTechnique,
): JourneyState {
  return updateActive(state, (journey) => ({
    ...journey,
    techniques: journey.techniques.map((technique) =>
      technique.id === techniqueId ? update(technique) : technique,
    ),
  }));
}

function uniqueId(id: string, taken: Set<string>): string {
  let candidate = id;
  for (let suffix = 2; taken.has(candidate); suffix += 1) candidate = `${id}-${suffix}`;
  return candidate;
}
