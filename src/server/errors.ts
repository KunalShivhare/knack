import type { PlanErrorCode } from '@/shared/contracts';

import { LlmError } from './llm';

const MESSAGES: Record<PlanErrorCode, string> = {
  busy: 'The AI is busy right now. Give it a minute and try again.',
  invalid: "The AI's answer didn't hold together. Try again.",
  failed: "Couldn't reach the AI. Try again.",
};

/**
 * What the app is told when generation fails. The detail stays in the server log:
 * provider responses can carry request ids and quota details a user has no use for.
 */
export function toPlanError(error: unknown): { code: PlanErrorCode; message: string } {
  console.error(error);

  const code: PlanErrorCode =
    error instanceof LlmError && (error.kind === 'busy' || error.kind === 'invalid')
      ? error.kind
      : 'failed';

  return { code, message: MESSAGES[code] };
}
