/** A request for JSON that matches `schema`, in the shape both providers can take. */
export type JsonPrompt = {
  /** Identifies the schema to providers that require a name for it. */
  name: string;
  system: string;
  user: string;
  /** JSON Schema, already reduced to the keywords the providers accept. */
  schema: Record<string, unknown>;
  /** Pictures sent after `user`, in order. Only Gemini can see them. */
  images?: InlineImage[];
};

/** Image bytes as the model API takes them. */
export type InlineImage = { mimeType: string; data: string };

/**
 * `busy` is worth retrying shortly (rate limit, overload); `invalid` means the
 * model answered but not with a usable plan; `unconfigured` is a missing key;
 * `failed` is everything else.
 */
export type LlmErrorKind = 'busy' | 'invalid' | 'unconfigured' | 'failed';

export class LlmError extends Error {
  readonly kind: LlmErrorKind;

  constructor(kind: LlmErrorKind, message: string) {
    super(message);
    this.name = 'LlmError';
    this.kind = kind;
  }
}

export async function errorFromResponse(provider: string, response: Response): Promise<LlmError> {
  const detail = (await response.text().catch(() => '')).slice(0, 300);
  const kind = response.status === 429 || response.status === 503 ? 'busy' : 'failed';
  return new LlmError(kind, `${provider} responded ${response.status}: ${detail}`);
}
