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
  it('searches a long phrase as written and with each word left out', () => {
    expect(searchQueries('guitar sitting posture')).toEqual([
      'guitar sitting posture',
      'sitting posture',
      'guitar posture',
      'guitar sitting',
    ]);
  });

  it('stops at four searches', () => {
    expect(searchQueries('classical guitar sitting posture diagram')).toHaveLength(4);
  });

  it('does not shorten a phrase of two words, which would lose what it is about', () => {
    expect(searchQueries(' chess  fork ')).toEqual(['chess fork']);
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
  it('turns the numbered pick into an index', () => {
    expect(parseChoice('{"pick":2,"caption":" Look at the wrist. "}', 3)).toEqual({ index: 1, caption: 'Look at the wrist.' });
  });

  it('reads a null pick as no fitting picture', () => {
    expect(parseChoice('{"pick":null,"caption":""}', 3)).toBeNull();
  });

  it('treats a pick outside what was shown as a failure to retry, not as "no picture"', () => {
    expect(() => parseChoice('{"pick":4,"caption":"x"}', 3)).toThrow('image 4 of 3');
    expect(() => parseChoice('{"pick":0,"caption":"x"}', 3)).toThrow();
    expect(() => parseChoice('not json', 3)).toThrow('not valid JSON');
  });
});
