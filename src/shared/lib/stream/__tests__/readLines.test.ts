/** @jest-environment node */
import { readLines } from '../readLines';

function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
}

async function linesOf(chunks: Uint8Array[]): Promise<string[]> {
  const lines: string[] = [];
  for await (const line of readLines(streamOf(chunks))) lines.push(line);
  return lines;
}

const encode = (text: string) => new TextEncoder().encode(text);

describe('readLines', () => {
  it('reassembles lines split across chunks and strips CRLF', async () => {
    await expect(linesOf([encode('{"a":1}\r\n{"b"'), encode(':2}\n')])).resolves.toEqual([
      '{"a":1}',
      '{"b":2}',
    ]);
  });

  it('decodes a multi-byte character split between two chunks', async () => {
    const bytes = encode('café\n');
    const split = bytes.indexOf(0xc3) + 1;

    await expect(linesOf([bytes.slice(0, split), bytes.slice(split)])).resolves.toEqual(['café']);
  });

  it('yields a final line that has no trailing newline', async () => {
    await expect(linesOf([encode('one\ntwo')])).resolves.toEqual(['one', 'two']);
  });
});
