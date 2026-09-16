/** @jest-environment node */
import { createArrayScanner } from '../arrayScanner';

/** Feeds `text` in chunks of `size` and collects every element the scanner completes. */
function scanInChunks(text: string, size: number): string[] {
  const scanner = createArrayScanner('techniques');
  const found: string[] = [];

  for (let index = 0; index < text.length; index += size) {
    found.push(...scanner.push(text.slice(index, index + size)));
  }

  return found;
}

const document = JSON.stringify({
  hobby: 'Chess',
  goal: 'Win more club games',
  notes: [{ ignored: true }],
  techniques: [
    { id: 'forks', title: 'Knight {forks}', drill: { task: 'Solve "10" puzzles]', minutes: 15 } },
    { id: 'pins', title: 'Pins \\ skewers', drill: { task: 'Spot the pin', minutes: 10 } },
  ],
});

describe('createArrayScanner', () => {
  it('returns each element of the target array once it closes', () => {
    const found = scanInChunks(document, document.length);

    expect(found.map((raw) => JSON.parse(raw).id)).toEqual(['forks', 'pins']);
  });

  it('gives the same result however the stream is split, down to single characters', () => {
    const whole = scanInChunks(document, document.length);

    for (const size of [1, 2, 7, 33]) {
      expect(scanInChunks(document, size)).toEqual(whole);
    }
  });

  it('is not fooled by braces, brackets, quotes or backslashes inside strings', () => {
    const [forks, pins] = scanInChunks(document, 3).map((raw) => JSON.parse(raw));

    expect(forks.title).toBe('Knight {forks}');
    expect(forks.drill.task).toBe('Solve "10" puzzles]');
    expect(pins.title).toBe('Pins \\ skewers');
  });

  it('ignores arrays under any other key', () => {
    const found = scanInChunks(document, 5);

    expect(found.some((raw) => raw.includes('ignored'))).toBe(false);
  });

  it('holds back an element that has not closed yet', () => {
    const scanner = createArrayScanner('techniques');

    expect(scanner.push('{"techniques":[{"id":"forks","drill":{"minutes":1}')).toEqual([]);
    expect(scanner.push('}')).toEqual(['{"id":"forks","drill":{"minutes":1}}']);
  });
});
