/** @jest-environment node */
import { parseTechnique } from '../parseTechnique';

const valid = {
  id: 'clean-changes',
  title: 'Clean chord changes',
  summary: 'Switch chords without stopping.',
  medium: 'practice',
  mediumReason: 'Built by repetition.',
  explainer: 'Move all fingers together.',
  visual: null,
  drill: { task: 'Switch G to C twenty times.', minutes: 10 },
  masteryCheck: "You've got it when it is clean.",
};

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('parseTechnique', () => {
  it('turns any id into a clean slug instead of dropping the technique', () => {
    expect(parseTechnique({ ...valid, id: 'Clean_Chord Changes!' })?.id).toBe('clean-chord-changes');
    expect(parseTechnique({ ...valid, id: '' })?.id).toBe('clean-chord-changes');
  });

  it('brings a drill length back inside five to sixty minutes', () => {
    expect(parseTechnique({ ...valid, drill: { ...valid.drill, minutes: 75 } })?.drill.minutes).toBe(60);
    expect(parseTechnique({ ...valid, drill: { ...valid.drill, minutes: 2.4 } })?.drill.minutes).toBe(5);
  });

  it('keeps a short visual and trims one longer than its layout', () => {
    const steps = (count: number) =>
      Array.from({ length: count }, (_, index) => ({ label: `Step ${index}`, detail: 'Do it.' }));

    const two = parseTechnique({ ...valid, medium: 'visual', visual: { kind: 'steps', title: 'T', steps: steps(2) } });
    const nine = parseTechnique({ ...valid, medium: 'visual', visual: { kind: 'steps', title: 'T', steps: steps(9) } });

    expect(two?.visual).toMatchObject({ steps: steps(2) });
    expect(nine?.visual).toMatchObject({ steps: steps(6) });
  });

  it('leaves out a malformed visual that was optional anyway', () => {
    const technique = parseTechnique({ ...valid, visual: { kind: 'steps', title: 'Steps', steps: [] } });

    expect(technique?.visual).toBeNull();
  });

  it('still rejects a visual technique without a usable visual', () => {
    expect(parseTechnique({ ...valid, medium: 'visual', visual: { kind: 'chart' } })).toBeNull();
  });

  it('still rejects missing content', () => {
    expect(parseTechnique({ ...valid, explainer: '' })).toBeNull();
    expect(parseTechnique({ ...valid, medium: 'video' })).toBeNull();
  });
});
