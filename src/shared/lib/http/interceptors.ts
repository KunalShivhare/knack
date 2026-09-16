import type { AxiosInstance } from 'axios';

import { toApiError } from './errors';

let requestCount = 0;

/**
 * Attaches the app's two cross-cutting concerns to an axios instance.
 *
 * Request: a per-request id, so a failure in a log can be matched to the call
 * that caused it.
 *
 * Response: unwraps `response.data` and converts every failure into an
 * `ApiError`. Callers therefore receive the payload directly and catch one
 * error shape — no `response.data.data`, no axios types leaking upward.
 */
export function attachInterceptors(client: AxiosInstance): AxiosInstance {
  client.interceptors.request.use((config) => {
    requestCount += 1;
    config.headers.set('X-Request-Id', `knack-${Date.now()}-${requestCount}`);
    return config;
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return client;
}
