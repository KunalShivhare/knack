import { LlmError, errorFromResponse, type JsonPrompt } from './types';

const URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';

/**
 * The fallback. Groq's strict JSON-schema mode guarantees the shape, but it
 * cannot stream in that mode, so it only ever stands in for Gemini before the
 * first technique has been shown — the app staggers the reveal either way.
 */
export async function generateJson(prompt: JsonPrompt, signal: AbortSignal): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new LlmError('unconfigured', 'GROQ_API_KEY is not set.');

  const response = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? DEFAULT_MODEL,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: prompt.name, strict: true, schema: prompt.schema },
      },
      // Low effort keeps a plan inside the free plan's 8K tokens-per-minute.
      reasoning_effort: 'low',
      temperature: 0.6,
    }),
    signal,
  });

  if (!response.ok) throw await errorFromResponse('Groq', response);

  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = payload.choices?.[0]?.message?.content;

  if (!text) throw new LlmError('failed', 'Groq returned no text.');
  return text;
}
