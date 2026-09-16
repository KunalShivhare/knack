import { readLines } from '@/shared/lib/stream/readLines';

import { LlmError, errorFromResponse, type JsonPrompt } from './types';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Tried in order. Free-tier Flash models go through spells of "high demand"
 * refusals independently of each other, so when one is overloaded the next is
 * usually answering. Strongest first; the lite model is the last resort.
 * Overridable with GEMINI_MODELS because the free lineup changes often.
 */
const DEFAULT_MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];

/**
 * How long a model gets to start answering. Only the wait for response headers
 * is timed: a streamed plan that is already arriving is never cut off.
 */
const CONNECT_TIMEOUT_MS = 20_000;

type GeminiPayload = {
  promptFeedback?: { blockReason?: string };
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string; thought?: boolean }[] };
  }[];
};

/**
 * Gemini is the primary model: its free tier allows a JSON schema and streaming
 * in the same call, which is what lets techniques appear one at a time.
 */
export async function* streamJson(prompt: JsonPrompt, signal: AbortSignal): AsyncGenerator<string> {
  const response = await post('streamGenerateContent?alt=sse', prompt, signal);

  if (!response.body) throw new LlmError('failed', 'Gemini returned an empty stream.');

  for await (const line of readLines(response.body)) {
    if (!line.startsWith('data:')) continue;

    const text = textOf(JSON.parse(line.slice('data:'.length)) as GeminiPayload);
    if (text) yield text;
  }
}

export async function generateJson(prompt: JsonPrompt, signal: AbortSignal): Promise<string> {
  const response = await post('generateContent', prompt, signal);
  const text = textOf((await response.json()) as GeminiPayload);

  if (!text) throw new LlmError('failed', 'Gemini returned no text.');
  return text;
}

async function post(method: string, prompt: JsonPrompt, signal: AbortSignal): Promise<Response> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new LlmError('unconfigured', 'GEMINI_API_KEY is not set.');

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: prompt.system }] },
    contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseJsonSchema: prompt.schema,
      temperature: 0.6,
    },
  });

  let lastError = new LlmError('unconfigured', 'No Gemini models are configured.');

  for (const model of models()) {
    const attempt = linkedController(signal);
    const timer = setTimeout(() => attempt.abort(), CONNECT_TIMEOUT_MS);

    try {
      const response = await fetch(`${BASE_URL}/${model}:${method}`, {
        method: 'POST',
        // In a header rather than the query string, so it never lands in a proxy's access log.
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body,
        signal: attempt.signal,
      });

      if (response.ok) return response;

      const error = await errorFromResponse(`Gemini ${model}`, response);
      // Only overload is worth another model; a bad request fails the same way on all of them.
      if (error.kind !== 'busy') throw error;
      lastError = error;
    } catch (error) {
      if (signal.aborted || error instanceof LlmError) throw error;
      // Timed out or unreachable: this model is not answering, so try the next.
      const reason = attempt.signal.aborted ? 'did not respond in time' : 'could not be reached';
      lastError = new LlmError('busy', `Gemini ${model} ${reason}.`);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

function models(): string[] {
  const configured = (process.env.GEMINI_MODELS ?? '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  return configured.length > 0 ? configured : DEFAULT_MODELS;
}

/** An abort controller that also aborts when `parent` does, so the caller can still cancel. */
function linkedController(parent: AbortSignal): AbortController {
  const controller = new AbortController();

  if (parent.aborted) controller.abort();
  else parent.addEventListener('abort', () => controller.abort(), { once: true });

  return controller;
}

function textOf(payload: GeminiPayload): string {
  const candidate = payload.candidates?.[0];

  if (payload.promptFeedback?.blockReason || candidate?.finishReason === 'SAFETY') {
    throw new LlmError('failed', 'Gemini declined to answer.');
  }

  return (candidate?.content?.parts ?? [])
    .filter((part) => !part.thought)
    .map((part) => part.text ?? '')
    .join('');
}
