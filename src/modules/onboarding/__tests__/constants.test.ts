import { hobbyEmoji, hobbyExamples } from '../constants';

describe('hobbyEmoji', () => {
  it('finds picked and typed hobbies alike', () => {
    expect(hobbyEmoji('Chess')).toBe('♟️');
    expect(hobbyEmoji('Reading')).toBe('📖');
  });

  it('matches whole words, so a word inside another does not count', () => {
    expect(hobbyEmoji('Speed reading')).toBe('📖');
    expect(hobbyEmoji('Bread baking')).toBe('🍞');
    expect(hobbyEmoji('Breadmaking')).toBeUndefined();
  });

  it('leaves unknown hobbies, and names that live on Object.prototype, to the initial', () => {
    expect(hobbyEmoji('Juggling')).toBeUndefined();
    expect(hobbyEmoji('constructor')).toBeUndefined();
  });
});

describe('hobbyExamples', () => {
  it('gives a suggestion its own examples and anything else ones that fit any hobby', () => {
    expect(hobbyExamples('Chess').goal).toMatch(/blunder/);
    expect(hobbyExamples('Juggling')).toEqual(hobbyExamples('Bouldering'));
    expect(hobbyExamples('Juggling').goal).not.toMatch(/song/);
  });
});
