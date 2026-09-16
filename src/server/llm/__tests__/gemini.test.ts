/** @jest-environment node */
import { generateJson, generateJsonFromImages } from '../gemini';
import type { JsonPrompt } from '../types';

const prompt: JsonPrompt = { name: 'plan', system: 'system', user: 'user', schema: { type: 'object' } };
const fetchMock = jest.fn();

const answer = (text: string) => Response.json({ candidates: [{ content: { parts: [{ text }] } }] });

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.GEMINI_MODELS = 'first,second';
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

afterAll(() => {
  delete process.env.GEMINI_MODELS;
  delete process.env.GEMINI_IMAGE_MODELS;
});

const modelsCalled = () =>
  fetchMock.mock.calls.map(([url]) => String(url).match(/models\/([^:]+)/)?.[1]);

describe('gemini', () => {
  it('moves on to the next model when one is overloaded', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('high demand', { status: 503 }))
      .mockResolvedValueOnce(answer('{"ok":true}'));

    await expect(generateJson(prompt, new AbortController().signal)).resolves.toBe('{"ok":true}');
    expect(modelsCalled()).toEqual(['first', 'second']);
  });

  it('does not retry a request every model would reject', async () => {
    fetchMock.mockResolvedValue(new Response('bad schema', { status: 400 }));

    await expect(generateJson(prompt, new AbortController().signal)).rejects.toMatchObject({
      kind: 'failed',
    });
    expect(modelsCalled()).toEqual(['first']);
  });

  it('reports busy once every model is overloaded', async () => {
    fetchMock.mockResolvedValue(new Response('rate limited', { status: 429 }));

    await expect(generateJson(prompt, new AbortController().signal)).rejects.toMatchObject({
      kind: 'busy',
    });
    expect(modelsCalled()).toEqual(['first', 'second']);
  });

  it('keeps the answer text and drops thought parts', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        candidates: [{ content: { parts: [{ text: 'thinking', thought: true }, { text: '{}' }] } }],
      }),
    );

    await expect(generateJson(prompt, new AbortController().signal)).resolves.toBe('{}');
  });

  it('judges images with their own models, sending the pictures after the text', async () => {
    process.env.GEMINI_IMAGE_MODELS = 'vision';
    fetchMock.mockResolvedValue(answer('{"pick":null}'));

    const images = [{ mimeType: 'image/png', data: 'AAAA' }];
    await generateJsonFromImages({ ...prompt, images }, new AbortController().signal);

    expect(modelsCalled()).toEqual(['vision']);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.contents[0].parts).toEqual([{ text: 'user' }, { inlineData: images[0] }]);
  });
});
