import type { ImageRequest, TechniqueImage } from '@/shared/contracts';

import { MAX_CANDIDATES, downloadThumbnail, searchCommons, type Candidate } from './images/commons';
import { LlmError, generateJsonFromImages } from './llm';
import { ImageChoiceSchema, imagePrompt } from './prompts/image';

/**
 * A real picture for a technique, or `null` when none fits.
 *
 * Search alone cannot be trusted with this: "chess fork" also finds lemon chess
 * pie. So the candidates are downloaded and shown to Gemini, which picks the one
 * that shows the technique or rejects them all. No picture is a normal answer;
 * a wrong one teaches the wrong thing.
 */
export async function findImage(request: ImageRequest, signal: AbortSignal): Promise<TechniqueImage | null> {
  // Plans saved before techniques carried a phrase are searched by title, minus its punctuation.
  const query = request.query ?? `${request.hobby} ${request.title}`.replace(/[^\p{L}\p{N}\s]/gu, ' ');
  const queries = searchQueries(query);
  const results = await Promise.all(queries.map((query) => searchCommons(query, signal)));
  const candidates = interleave(results);

  const downloads = await Promise.all(
    candidates.map(async (candidate) => ({ candidate, image: await downloadThumbnail(candidate.thumbUrl, signal) })),
  );
  const shown = downloads.flatMap(({ candidate, image }) => (image ? [{ candidate, image }] : []));

  if (shown.length === 0) return null;

  const text = await generateJsonFromImages(
    { ...imagePrompt(request, shown.length), images: shown.map(({ image }) => image) },
    signal,
  );
  const choice = parseChoice(text, shown.length);
  if (!choice) return null;

  const { candidate } = shown[choice.index];

  return {
    url: candidate.thumbUrl,
    width: candidate.width,
    height: candidate.height,
    caption: choice.caption,
    credit: candidate.credit,
    license: candidate.license,
    sourceUrl: candidate.sourceUrl,
  };
}

/**
 * Commons search requires every word to match, and ranks by text rather than by
 * what a picture shows. "guitar sitting posture" finds concert photos of seated
 * guitarists; "guitar posture" finds the instructional ones. So the phrase is
 * searched as written and with each word left out in turn, all at once.
 */
export function searchQueries(query: string): string[] {
  const words = query.trim().split(/\s+/);
  if (words.length < 3) return [words.join(' ')];

  const shorter = words.map((_, skip) => words.filter((__, index) => index !== skip).join(' '));
  // Four searches at most: the phrase and its first three shortenings.
  return [words.join(' '), ...shorter].slice(0, 4);
}

/**
 * Takes results a rank at a time across searches, so the best match of every
 * search reaches the model before the tenth match of the first one. The same
 * file found twice is shown once.
 */
export function interleave(results: Candidate[][]): Candidate[] {
  const seen = new Set<string>();
  const merged: Candidate[] = [];
  const depth = Math.max(0, ...results.map((list) => list.length));

  for (let rank = 0; rank < depth && merged.length < MAX_CANDIDATES; rank += 1) {
    for (const list of results) {
      const candidate = list[rank];
      if (!candidate || seen.has(candidate.sourceUrl) || merged.length >= MAX_CANDIDATES) continue;
      seen.add(candidate.sourceUrl);
      merged.push(candidate);
    }
  }

  return merged;
}

/**
 * The model's choice as an index into what it was shown, or `null` for none.
 *
 * An answer that does not parse, or names an image it was not shown, is an
 * error rather than "no picture": "no picture" is saved on the learner's device,
 * and a garbled answer deserves another try next time.
 */
export function parseChoice(text: string, count: number): { index: number; caption: string } | null {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new LlmError('invalid', 'The image choice was not valid JSON.');
  }

  const parsed = ImageChoiceSchema.safeParse(json);
  if (!parsed.success) throw new LlmError('invalid', 'The image choice did not match the schema.');

  const { pick, caption } = parsed.data;
  if (pick === null) return null;
  if (pick < 1 || pick > count) throw new LlmError('invalid', `The image choice named image ${pick} of ${count}.`);

  return { index: pick - 1, caption: caption.trim() };
}
