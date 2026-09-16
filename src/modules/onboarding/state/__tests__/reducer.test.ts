import { emptyAnswers, firstIncompleteStep, stepIsComplete } from '../../types';
import { initialState, onboardingReducer } from '../reducer';

describe('onboardingReducer', () => {
  it('starts un-hydrated so nothing renders against a guess', () => {
    expect(initialState.hydrated).toBe(false);
  });

  it('hydrating with nothing saved yields a fresh run', () => {
    const state = onboardingReducer(initialState, { type: 'hydrated', persisted: null });

    expect(state.hydrated).toBe(true);
    expect(state.completed).toBe(false);
    expect(state.answers).toEqual(emptyAnswers);
  });

  it('hydrating a partial record fills the gaps with defaults', () => {
    const state = onboardingReducer(initialState, {
      type: 'hydrated',
      // A record written by an older build, missing fields added since.
      persisted: { answers: { name: 'Ada' } as never, completed: false },
    });

    expect(state.answers.name).toBe('Ada');
    expect(state.answers.weeklyHours).toBeNull();
  });

  it('answers merge rather than replace', () => {
    const hydrated = onboardingReducer(initialState, { type: 'hydrated', persisted: null });
    const named = onboardingReducer(hydrated, { type: 'answer', patch: { name: 'Ada' } });
    const withHobby = onboardingReducer(named, { type: 'answer', patch: { hobby: 'Chess' } });

    expect(withHobby.answers.name).toBe('Ada');
    expect(withHobby.answers.hobby).toBe('Chess');
  });

  it('reset clears answers but remembers that storage was read', () => {
    const hydrated = onboardingReducer(initialState, { type: 'hydrated', persisted: null });
    const named = onboardingReducer(hydrated, { type: 'answer', patch: { name: 'Ada' } });

    const state = onboardingReducer(named, { type: 'reset' });

    expect(state.answers).toEqual(emptyAnswers);
    expect(state.hydrated).toBe(true);
  });
});

describe('step completion', () => {
  it('treats whitespace as unanswered', () => {
    expect(stepIsComplete.name({ ...emptyAnswers, name: '   ' })).toBe(false);
    expect(stepIsComplete.name({ ...emptyAnswers, name: 'Ada' })).toBe(true);
  });

  it('needs both halves of the goal step', () => {
    expect(stepIsComplete.goal({ ...emptyAnswers, level: 'new' })).toBe(false);
    expect(stepIsComplete.goal({ ...emptyAnswers, target: 'Play a song' })).toBe(false);
    expect(stepIsComplete.goal({ ...emptyAnswers, level: 'new', target: 'Play a song' })).toBe(true);
  });

  it('makes motivation optional and the time budget required', () => {
    expect(stepIsComplete.motivation({ ...emptyAnswers, motivation: 'For fun' })).toBe(false);
    expect(stepIsComplete.motivation({ ...emptyAnswers, weeklyHours: 'steady' })).toBe(true);
  });
});

describe('firstIncompleteStep', () => {
  it('resumes on the earliest unanswered step, not the furthest reached', () => {
    // Hobby was answered, name was somehow not — the gap wins.
    expect(firstIncompleteStep({ ...emptyAnswers, hobby: 'Chess' })).toBe('name');
  });

  it('walks forward as answers land', () => {
    const answers = { ...emptyAnswers, name: 'Ada' };
    expect(firstIncompleteStep(answers)).toBe('hobby');

    answers.hobby = 'Chess';
    expect(firstIncompleteStep(answers)).toBe('goal');

    answers.level = 'dabbled';
    answers.target = 'Beat my brother';
    expect(firstIncompleteStep(answers)).toBe('motivation');
  });

  it('returns null once every step is answered', () => {
    expect(
      firstIncompleteStep({
        name: 'Ada',
        hobby: 'Chess',
        level: 'dabbled',
        target: 'Beat my brother',
        motivation: '',
        weeklyHours: 'steady',
      }),
    ).toBeNull();
  });
});
