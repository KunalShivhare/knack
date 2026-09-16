import type { Technique } from '@/shared/contracts';

import { createJourney, initialState, journeyReducer, type JourneyState } from '../reducer';

function technique(id: string): Technique {
  return {
    id,
    title: `Technique ${id}`,
    summary: 'Do it.',
    medium: 'practice',
    mediumReason: 'Reps.',
    explainer: 'Explained.',
    visual: null,
    drill: { task: 'Drill it.', minutes: 10 },
    masteryCheck: "You've got it when it works.",
  };
}

const AT = '2026-09-16T10:00:00.000Z';

function withJourney(): JourneyState {
  const hydrated = journeyReducer(initialState, { type: 'hydrated', persisted: null });

  return journeyReducer(hydrated, {
    type: 'created',
    journey: createJourney({
      id: 'j1',
      createdAt: AT,
      profile: { hobby: 'guitar', level: 'new', target: 'A song', motivation: '', weeklyHours: 'light' },
      meta: { hobby: 'Guitar', goal: 'Play a song' },
      techniques: [technique('a'), technique('b'), technique('c')],
    }),
  });
}

const techniquesOf = (state: JourneyState) => state.journeys[0].techniques;

describe('journeyReducer', () => {
  it('makes a new journey the active one, every technique still to do', () => {
    const state = withJourney();

    expect(state.activeId).toBe('j1');
    expect(techniquesOf(state).map((item) => item.status)).toEqual(['todo', 'todo', 'todo']);
  });

  it('records why a technique was struck, and forgets it on restore', () => {
    let state = journeyReducer(withJourney(), {
      type: 'statusChanged',
      techniqueId: 'b',
      status: 'struck',
      reason: 'too_hard',
      at: AT,
    });

    expect(techniquesOf(state)[1]).toMatchObject({ status: 'struck', struckReason: 'too_hard' });

    state = journeyReducer(state, { type: 'statusChanged', techniqueId: 'b', status: 'todo', at: AT });

    expect(techniquesOf(state)[1]).toMatchObject({ status: 'todo', struckReason: null });
  });

  it('puts a swapped-in technique right after the one it replaces', () => {
    const struck = journeyReducer(withJourney(), {
      type: 'statusChanged',
      techniqueId: 'a',
      status: 'struck',
      reason: 'disliked',
      at: AT,
    });

    const state = journeyReducer(struck, { type: 'swapped', techniqueId: 'a', replacement: technique('d'), at: AT });

    expect(techniquesOf(state).map((item) => item.id)).toEqual(['a', 'd', 'b', 'c']);
    expect(techniquesOf(state)[0]).toMatchObject({ status: 'struck', replacedById: 'd' });
    expect(techniquesOf(state)[1].status).toBe('todo');
  });

  it('renames a replacement whose id is already taken', () => {
    const state = journeyReducer(withJourney(), {
      type: 'swapped',
      techniqueId: 'a',
      replacement: technique('b'),
      at: AT,
    });

    expect(techniquesOf(state)[0].replacedById).toBe('b-2');
    expect(new Set(techniquesOf(state).map((item) => item.id)).size).toBe(4);
  });

  it('appends practice to the active journey', () => {
    const state = journeyReducer(withJourney(), {
      type: 'practiceLogged',
      techniqueId: 'a',
      minutes: 20,
      at: AT,
    });

    expect(state.journeys[0].practice).toEqual([{ techniqueId: 'a', minutes: 20, loggedAt: AT }]);
  });

  it('leaving keeps the journey stored but clears the active one', () => {
    const state = journeyReducer(withJourney(), { type: 'left' });

    expect(state.activeId).toBeNull();
    expect(state.journeys).toHaveLength(1);
  });
});
