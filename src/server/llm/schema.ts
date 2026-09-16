import { z } from 'zod';

/**
 * Keywords that zod emits but the providers' structured-output modes reject or
 * mishandle. Dropping them loosens only what the model is told: the response is
 * still validated against the full zod schema, lengths and patterns included.
 *
 * - `minimum`/`maximum`: zod writes JavaScript's safe-integer bound into every
 *   integer, and that number trips some validators.
 * - `minItems`/`maxItems`: Gemini compiles the schema into a decoding grammar,
 *   and array bounds nested inside other bounded arrays multiply its states
 *   until it refuses the schema outright ("too many states for serving"). The
 *   counts are stated in the prompt instead, and enforced on the way back.
 */
const UNSUPPORTED = new Set([
  '$schema',
  'minLength',
  'maxLength',
  'pattern',
  'minimum',
  'maximum',
  'minItems',
  'maxItems',
]);

/**
 * zod's JSON Schema, reduced to the subset both Gemini and Groq accept:
 * unsupported keywords dropped, `oneOf` written as `anyOf`, `const` as a
 * one-value `enum`, and an `anyOf` nested directly in another flattened —
 * which is how zod expresses a nullable union.
 */
export function toModelSchema(schema: z.ZodType): Record<string, unknown> {
  return normalise(z.toJSONSchema(schema)) as Record<string, unknown>;
}

function normalise(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(normalise);
  if (node === null || typeof node !== 'object') return node;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(node)) {
    if (UNSUPPORTED.has(key)) continue;

    if (key === 'const') {
      result.enum = [value];
    } else if (key === 'oneOf' || key === 'anyOf') {
      result.anyOf = (value as unknown[]).flatMap((option) => {
        const normalised = normalise(option) as Record<string, unknown>;
        const keys = Object.keys(normalised);
        return keys.length === 1 && keys[0] === 'anyOf' ? (normalised.anyOf as unknown[]) : [normalised];
      });
    } else {
      result[key] = normalise(value);
    }
  }

  return result;
}
