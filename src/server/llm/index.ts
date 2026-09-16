import * as gemini from './gemini';
import * as groq from './groq';
import { LlmError, type JsonPrompt } from './types';

export { streamJson } from './gemini';
/** For prompts with images. Groq's models cannot see them, so there is no fallback. */
export { generateJson as generateJsonFromImages } from './gemini';
export { toModelSchema } from './schema';
export { LlmError } from './types';

export type { InlineImage, JsonPrompt, LlmErrorKind } from './types';

/** A single JSON response, from Gemini or, failing that, Groq. */
export async function generateJson(prompt: JsonPrompt, signal: AbortSignal): Promise<string> {
  try {
    return await gemini.generateJson(prompt, signal);
  } catch (primary) {
    return fallbackJson(prompt, signal, primary);
  }
}

/**
 * Asks Groq after Gemini has failed with `primary`. If Groq is not configured,
 * the original failure is rethrown: "GROQ_API_KEY is not set" would hide the
 * reason the plan actually failed.
 */
export async function fallbackJson(
  prompt: JsonPrompt,
  signal: AbortSignal,
  primary: unknown,
): Promise<string> {
  if (signal.aborted) throw primary;

  try {
    return await groq.generateJson(prompt, signal);
  } catch (secondary) {
    throw secondary instanceof LlmError && secondary.kind === 'unconfigured' ? primary : secondary;
  }
}
