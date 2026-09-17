/** @jest-environment node */
import type { LearnerProfile, PlanStreamEvent, Technique } from '@/shared/contracts';

import { generatePlan } from '../generatePlan';
import { LlmError, fallbackJson, streamJson } from '../llm';

jest.mock('../llm', () => {
  const actual = jest.requireActual('../llm');
  return { ...actual, streamJson: jest.fn(), fallbackJson: jest.fn() };
});

const mockStream = streamJson as jest.MockedFunction<typeof streamJson>;
const mockFallback = fallbackJson as jest.MockedFunction<typeof fallbackJson>;

// `light` asks for exactly five techniques.
const profile: LearnerProfile = {
  hobby: 'guitar',
  level: 'dabbled',
  target: 'Play a full song',
  motivation: '',
  weeklyHours: 'light',
};

function technique(id: string, overrides: Partial<Technique> = {}): Technique {
  return {
    id,
    title: `Technique ${id}`,
    summary: 'Play something.',
    medium: 'practice',
    mediumReason: 'It is built by repetition.',
    explainer: 'Do the thing.',
    visual: null,
    imageQuery: null,
    drill: { task: 'Repeat it ten times.', minutes: 10 },
    masteryCheck: "You've got it when it is clean.",
    ...overrides,
  };
}

function planText(techniques: unknown[], emoji: unknown = '🎸'): string {
  return JSON.stringify({ hobby: 'Guitar', goal: 'Play a full song', emoji, techniques });
}

/** A fake Gemini stream that yields `text` in chunks, then optionally fails. */
async function* chunks(text: string, size = 40, failAfter?: Error): AsyncGenerator<string> {
  for (let index = 0; index < text.length; index += size) yield text.slice(index, index + size);
  if (failAfter) throw failAfter;
}

async function collect(): Promise<PlanStreamEvent[]> {
  const events: PlanStreamEvent[] = [];
  for await (const event of generatePlan(profile, new AbortController().signal)) events.push(event);
  return events;
}

const five = ['a', 'b', 'c', 'd', 'e'].map((id) => technique(id));

beforeEach(() => {
  mockStream.mockReset();
  mockFallback.mockReset();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('generatePlan', () => {
  it('emits each technique as it arrives, then done with the plan meta', async () => {
    mockStream.mockReturnValue(chunks(planText(five)));

    const events = await collect();

    expect(events.map((event) => event.type)).toEqual([
      'technique', 'technique', 'technique', 'technique', 'technique', 'done',
    ]);
    expect(events.at(-1)).toEqual({ type: 'done', meta: { hobby: 'Guitar', goal: 'Play a full song', emoji: '🎸' } });
    expect(mockFallback).not.toHaveBeenCalled();
  });

  it.each([
    ['a multi-codepoint emoji', '🧗\u200d♀️', '🧗\u200d♀️'],
    ['a word instead of an emoji', 'guitar', null],
    ['an emoji followed by text', '🎸 guitar', null],
    ['a run of emoji', '🎸🎸🎸🎸🎸🎸🎸🎸🎸', null],
    ['no emoji at all', null, null],
  ])('keeps the hobby emoji only when it is one emoji: %s', async (_case, emoji, expected) => {
    mockStream.mockReturnValue(chunks(planText(five, emoji)));

    const events = await collect();

    expect(events.at(-1)).toEqual({
      type: 'done',
      meta: { hobby: 'Guitar', goal: 'Play a full song', emoji: expected },
    });
  });

  it('streams the first technique before the response has finished', async () => {
    mockStream.mockReturnValue(chunks(planText(five), 10));

    const iterator = generatePlan(profile, new AbortController().signal);
    const first = await iterator.next();

    expect(first.value).toMatchObject({ type: 'technique', technique: { id: 'a' } });
    await iterator.return(undefined);
  });

  it('drops a malformed technique and keeps the rest', async () => {
    const visualWithoutVisual = [...five, technique('f', { medium: 'visual', visual: null })];
    mockStream.mockReturnValue(chunks(planText([{ id: 'broken' }, ...visualWithoutVisual])));

    const ids = (await collect()).flatMap((event) =>
      event.type === 'technique' ? [event.technique.id] : [],
    );

    expect(ids).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('never keeps more techniques than the budget allows', async () => {
    mockStream.mockReturnValue(chunks(planText([...five, technique('extra')])));

    const count = (await collect()).filter((event) => event.type === 'technique').length;

    expect(count).toBe(5);
  });

  it('makes duplicate ids unique so the app can key on them', async () => {
    mockStream.mockReturnValue(chunks(planText(five.map((item) => ({ ...item, id: 'same' })))));

    const ids = (await collect()).flatMap((event) =>
      event.type === 'technique' ? [event.technique.id] : [],
    );

    expect(new Set(ids).size).toBe(5);
  });

  it('falls back to a second model when the stream fails before any technique', async () => {
    const busy = new LlmError('busy', 'rate limited');
    mockStream.mockReturnValue(chunks('', 1, busy));
    mockFallback.mockResolvedValue(planText(five));

    const events = await collect();

    expect(mockFallback).toHaveBeenCalledWith(expect.anything(), expect.anything(), busy);
    expect(events.filter((event) => event.type === 'technique')).toHaveLength(5);
  });

  it('falls back when the stream finishes without a usable technique', async () => {
    mockStream.mockReturnValue(chunks(planText([{ id: 'broken' }])));
    mockFallback.mockResolvedValue(planText(five));

    const events = await collect();

    expect(events.filter((event) => event.type === 'technique')).toHaveLength(5);
  });

  it('does not switch models once a technique has been shown', async () => {
    const partial = planText(five).slice(0, planText(five).indexOf('"id":"c"'));
    mockStream.mockReturnValue(chunks(partial, 40, new LlmError('failed', 'dropped')));

    await expect(collect()).rejects.toThrow('dropped');
    expect(mockFallback).not.toHaveBeenCalled();
  });

  it('rejects a plan with too few usable techniques', async () => {
    mockStream.mockReturnValue(chunks(planText(five.slice(0, 3))));

    await expect(collect()).rejects.toMatchObject({ kind: 'invalid' });
  });
});
