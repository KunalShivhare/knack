import type { SwapRequest, Technique } from '@/shared/contracts';

import { LlmError, generateJson } from './llm';
import { parseTechnique } from './parseTechnique';
import { swapPrompt } from './prompts/swap';

/**
 * One replacement technique for a struck one. Rejected if the model hands back a
 * technique the plan already holds, which is the easy wrong answer to "give me
 * something else".
 */
export async function swapTechnique(request: SwapRequest, signal: AbortSignal): Promise<Technique> {
  const text = await generateJson(swapPrompt(request), signal);

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new LlmError('invalid', 'The replacement was not valid JSON.');
  }

  const technique = parseTechnique(json);
  if (!technique) throw new LlmError('invalid', 'The replacement did not match the schema.');

  const titles = new Set(request.planTitles.map(normalise));
  if (titles.has(normalise(technique.title))) {
    throw new LlmError('invalid', 'The replacement repeats a technique already in the plan.');
  }

  return technique;
}

function normalise(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}
