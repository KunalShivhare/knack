/** @jest-environment node */
import type { Candidate } from '../images/commons';
import { interleave, parseChoice, searchQueries } from '../findImage';

const candidate = (name: string): Candidate => ({
  thumbUrl: `https://upload.wikimedia.org/${name}.jpg`,
  width: 480,
  height: 360,
  credit: 'Jane Doe',
  license: 'CC BY 4.0',
  sourceUrl: `https://commons.wikimedia.org/wiki/File:${name}.jpg`,
});

describe('searchQueries', () => {
  it('searches the phrase, the phrase as a diagram, and the phrase with each word left out', () => {
    expect(searchQueries('guitar sitting posture')).toEqual([
      'guitar sitting posture',
      'guitar sitting posture diagram',
      'sitting posture',
      'guitar posture',
      'guitar sitting',
    ]);
  });

  it('stops at five searches', () => {
    expect(searchQueries('classical guitar sitting posture close up')).toHaveLength(5);
  });

  it('does not ask for a diagram of what is already one', () => {
    expect(searchQueries('E minor chord diagram')).not.toContain('E minor chord diagram diagram');
  });

  it('does not shorten a phrase of two words, which would lose what it is about', () => {
    expect(searchQueries(' chess  fork ')).toEqual(['chess fork', 'chess fork diagram']);
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
