import {
  TECHNIQUE_COUNT,
  type LearnerProfile,
  type PlanMeta,
  type PlanStreamEvent,
  type Technique,
} from '@/shared/contracts';
import { PlanMetaSchema } from '@/shared/contracts/schemas';

import { createArrayScanner } from './json/arrayScanner';
import { LlmError, fallbackJson, streamJson } from './llm';
import { parseTechnique } from './parseTechnique';
import { planPrompt } from './prompts/plan';

/** The brief's floor. A plan a technique short of its budget is still a plan. */
const MIN_TECHNIQUES = 5;

/**
 * Generates a plan as a sequence of events: each technique the moment it has
 * been written and validated, then `done` with the plan's name and goal.
 *
 * Gemini streams; if it fails or produces nothing usable before anything has
 * been shown, Groq answers in one piece instead. Once a technique is on screen
 * there is no fallback — a second model would start a different plan underneath
 * the one being watched.
 */
export async function* generatePlan(
  profile: LearnerProfile,
  signal: AbortSignal,
): AsyncGenerator<PlanStreamEvent> {
  const prompt = planPrompt(profile);
  const count = TECHNIQUE_COUNT[profile.weeklyHours];
  const accept = createCollector(count);

  let scanner = createArrayScanner('techniques');
  let streamError: unknown = new LlmError('invalid', 'Gemini returned no usable techniques.');

  try {
    for await (const chunk of streamJson(prompt, signal)) {
      for (const technique of accept(scanner.push(chunk))) {
        yield { type: 'technique', technique };
      }
    }
  } catch (error) {
    if (accept.count() > 0) throw error;
    streamError = error;
  }

  if (accept.count() === 0) {
    scanner = createArrayScanner('techniques');
    const text = await fallbackJson(prompt, signal, streamError);

    for (const technique of accept(scanner.push(text))) {
      yield { type: 'technique', technique };
    }
  }

  if (accept.count() < Math.min(MIN_TECHNIQUES, count)) {
    throw new LlmError('invalid', `Only ${accept.count()} usable techniques in the response.`);
  }

  yield { type: 'done', meta: metaOf(scanner.text(), profile) };
}

/**
 * Parses and validates raw technique texts, keeping at most `count` and making
 * ids unique. A technique that cannot be repaired is dropped rather than failing
 * the plan: the rest is still good, and the minimum check catches a bad response.
 */
function createCollector(count: number) {
  const ids = new Set<string>();

  const accept = (raws: string[]): Technique[] => {
    const accepted: Technique[] = [];

    for (const raw of raws) {
      if (ids.size >= count) break;

      const parsed = parseTechnique(parseJson(raw));
      if (!parsed) continue;

      const technique = { ...parsed, id: uniqueId(parsed.id, ids) };
      ids.add(technique.id);
      accepted.push(technique);
    }

    return accepted;
  };

  accept.count = () => ids.size;
  return accept;
}

function uniqueId(id: string, taken: Set<string>): string {
  let candidate = id;
  for (let suffix = 2; taken.has(candidate); suffix += 1) candidate = `${id}-${suffix}`;
  return candidate;
}

/**
 * The model's display name and goal, or the learner's own words if those did not
 * parse. The emoji is judged on its own, so a bad one costs only the emoji.
 */
function metaOf(text: string, profile: LearnerProfile): PlanMeta {
  const json = parseJson(text);
  const parsed = PlanMetaSchema.safeParse(json);
  const emoji = emojiOf((json as { emoji?: unknown } | null)?.emoji);

  return parsed.success
    ? { hobby: parsed.data.hobby, goal: parsed.data.goal, emoji }
    : { hobby: profile.hobby, goal: profile.target, emoji };
}

/** Emoji code points only: pictographs, skin tones, joiners and the emoji presentation selector. */
const EMOJI_ONLY = /^[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200d\ufe0f]+$/u;

/**
 * The value if it is exactly one emoji, else `null`. Counted in graphemes, so a
 * joined sequence like 🧗‍♀️ is one emoji and 🎸🎸 is two.
 */
function emojiOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const emoji = value.trim();
  const graphemes = [...new Intl.Segmenter().segment(emoji)].length;
  return graphemes === 1 && EMOJI_ONLY.test(emoji) ? emoji : null;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
