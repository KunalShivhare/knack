/** @jest-environment node */
import type { Candidate } from '../images/commons';
import { interleave, isRelevant, keywordsOf, parseChoice, searchQueries } from '../findImage';

const candidate = (name: string): Candidate => ({
  title: `File:${name}.jpg`,
  thumbUrl: `https://upload.wikimedia.org/${name}.jpg`,
  width: 480,
  height: 360,
  credit: 'Jane Doe',
  license: 'CC BY 4.0',
  sourceUrl: `https://commons.wikimedia.org/wiki/File:${name}.jpg`,
});

describe('searchQueries', () => {
  it('searches the phrase, the phrase as a diagram, and the phrase with each word left out', () => {
    expect(searchQueries('chef knife pinch grip', 'Cooking')).toEqual([
      'chef knife pinch grip',
      'chef knife pinch grip diagram',
      'chef knife Cooking',
      'knife pinch grip',
      'chef pinch grip',
      'chef knife grip',
    ]);
  });

  it('never leaves out the hobby, which is what keeps a search on topic', () => {
    // "warrior one pose" without "yoga" finds military Warrior Games photos.
    expect(searchQueries('warrior one yoga pose', 'Yoga')).not.toContain('warrior one pose');
    expect(searchQueries('guitar sitting posture', 'Guitar')).toEqual([
      'guitar sitting posture',
      'guitar sitting posture diagram',
      'guitar posture',
      'guitar sitting',
    ]);
  });

  it('names the hobby alongside the technique when the phrase does not', () => {
    expect(searchQueries('downward dog hand placement', 'Yoga')).toContain('downward dog Yoga');
    expect(searchQueries('warrior one yoga pose', 'Yoga')).not.toContain('warrior one Yoga');
  });

  it('stops at six searches', () => {
    expect(searchQueries('classical guitar sitting posture close up', 'Guitar')).toHaveLength(6);
  });

  it('does not ask for a diagram of what is already one', () => {
    expect(searchQueries('E minor chord diagram', 'Guitar')).not.toContain('E minor chord diagram diagram');
  });

  it('does not shorten a phrase of two words, which would lose what it is about', () => {
    expect(searchQueries(' chess  fork ', 'Chess')).toEqual(['chess fork', 'chess fork diagram']);
  });
});

describe('isRelevant', () => {
  const keywords = keywordsOf('downward dog hand placement Yoga');

  it('keeps a file named for the technique or the hobby', () => {
    expect(isRelevant('File:Downward-Facing-Dog.JPG', keywords)).toBe(true);
    expect(isRelevant('File:Joshua Tree yoga - warrior 1a.jpg', keywords)).toBe(true);
  });

  it('drops a file whose name shares no word with either', () => {
    expect(isRelevant('File:Analyasis of Las Meninas.jpg', keywords)).toBe(false);
    expect(isRelevant('File:US, partner forces begin live-fire training.jpg', keywords)).toBe(false);
  });

  it('matches across accents and word endings', () => {
    const sauteing = keywordsOf('sautéing onions Cooking');

    expect(isRelevant('File:Leek-Sauté.JPG', sauteing)).toBe(true);
    expect(isRelevant('File:Sautee onions and peppers.jpg', sauteing)).toBe(true);
  });
});

describe('interleave', () => {
  it("takes every search's best match before anyone's second", () => {
    const merged = interleave([
      [candidate('a1'), candidate('a2')],
      [candidate('b1'), candidate('b2')],
    ]);

    expect(merged.map((item) => item.sourceUrl.split('File:')[1])).toEqual(['a1.jpg', 'b1.jpg', 'a2.jpg', 'b2.jpg']);
  });

  it('shows a file found by two searches once, and six files at most', () => {
    const many = Array.from({ length: 8 }, (_, index) => candidate(`x${index}`));
    const merged = interleave([[candidate('same'), ...many], [candidate('same')]]);

    expect(merged.filter((item) => item.sourceUrl.includes('same'))).toHaveLength(1);
    expect(merged).toHaveLength(6);
  });
});

describe('parseChoice', () => {
  const verdicts = (...flags: [boolean, boolean, boolean][]) =>
    flags.map(([safe, demonstrates, generic], index) => ({ number: index + 1, safe, demonstrates, generic }));
  const answer = (pick: number | null, images = verdicts([true, true, false], [true, true, false], [true, true, false])) =>
    JSON.stringify({ images, pick, caption: ' Copy the wrist angle. ' });

  it('turns the numbered pick into an index', () => {
    expect(parseChoice(answer(2), 3)).toEqual({ index: 1, caption: 'Copy the wrist angle.' });
  });

  it('reads a null pick as no fitting picture', () => {
    expect(parseChoice(answer(null), 3)).toBeNull();
  });

  it('refuses a pick the model itself judged unsafe, generic or not a demonstration', () => {
    const images = verdicts([false, true, false], [true, false, false], [true, true, true]);

    expect(parseChoice(answer(1, images), 3)).toBeNull();
    expect(parseChoice(answer(2, images), 3)).toBeNull();
    expect(parseChoice(answer(3, images), 3)).toBeNull();
    expect(parseChoice(answer(1, []), 3)).toBeNull();
  });

  it('treats a pick outside what was shown as a failure to retry, not as "no picture"', () => {
    expect(() => parseChoice(answer(4), 3)).toThrow('image 4 of 3');
    expect(() => parseChoice(answer(0), 3)).toThrow();
    expect(() => parseChoice('not json', 3)).toThrow('not valid JSON');
  });
});
