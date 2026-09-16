import { isAxiosError } from 'axios';

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'unknown';

/**
 * The single error shape the app handles. Screens branch on `kind`, never on an
 * axios internal, which is what keeps axios replaceable and error copy testable.
 */
export type ApiError = {
  kind: ApiErrorKind;
  message: string;
  /** Present only when the server answered. */
  status?: number;
};

const MESSAGES: Record<ApiErrorKind, string> = {
  network: "Can't reach the server. Check your connection and try again.",
  timeout: 'That took too long. Try again.',
  http: 'Something went wrong on our side. Try again.',
  unknown: 'Something went wrong. Try again.',
};

/** Normalises anything thrown by a request into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return { kind: 'unknown', message: MESSAGES.unknown };
  }

  // Checked before `response`, because a timed-out request has no response and
  // would otherwise fall through to `network` and show the wrong message.
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return { kind: 'timeout', message: MESSAGES.timeout };
  }

  if (error.response) {
    const { status } = error.response;
    const serverMessage = (error.response.data as { message?: unknown } | undefined)?.message;

    return {
      kind: 'http',
      status,
      message: typeof serverMessage === 'string' && serverMessage ? serverMessage : MESSAGES.http,
    };
  }

  return { kind: 'network', message: MESSAGES.network };
}

/** Type guard for `catch` blocks, which receive `unknown`. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    'message' in value
  );
}
