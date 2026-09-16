import { fetch } from 'expo/fetch';

import type {
  ImageRequest,
  LearnerProfile,
  PlanStreamEvent,
  SwapRequest,
  Technique,
  TechniqueImage,
} from '@/shared/contracts';
import { api, apiUrl, type ApiError } from '@/shared/lib/http';
import { readLines } from '@/shared/lib/stream/readLines';

const DROPPED: ApiError = {
  kind: 'network',
  message: 'The connection dropped before your plan was finished. Try again.',
};

/**
 * Streams a plan, calling `onEvent` for every event as it arrives.
 *
 * `expo/fetch` rather than the axios client: axios on React Native sits on
 * XMLHttpRequest, which hands over the body only once it is complete — the
 * whole point of streaming lost. Failures are thrown as the same `ApiError`
 * the axios client produces, so screens handle one error shape either way.
 */
export async function streamPlan(
  profile: LearnerProfile,
  onEvent: (event: PlanStreamEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  let response: Awaited<ReturnType<typeof fetch>>;

  try {
    response = await fetch(apiUrl('/api/plans'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw {
      kind: 'network',
      message: "Can't reach the server. Check your connection and try again.",
    } satisfies ApiError;
  }

  if (!response.ok || !response.body) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw {
      kind: 'http',
      status: response.status,
      message: payload?.message ?? 'Something went wrong on our side. Try again.',
    } satisfies ApiError;
  }

  let finished = false;

  try {
    for await (const line of readLines(response.body)) {
      if (!line.trim()) continue;

      const event = JSON.parse(line) as PlanStreamEvent;
      if (event.type !== 'technique') finished = true;
      onEvent(event);
    }
  } catch (error) {
    if (signal.aborted) throw error;
    throw DROPPED;
  }

  // The server always ends with `done` or `error`; a stream that just stops was cut off.
  if (!finished) throw DROPPED;
}

export function requestSwap(request: SwapRequest): Promise<Technique> {
  return api
    .post<{ technique: Technique }, { technique: Technique }>('/api/swap', request)
    .then((response) => response.technique);
}

/** Longer than the client default: the lookup searches, downloads and asks the model. */
const IMAGE_TIMEOUT_MS = 40_000;

export function requestImage(request: ImageRequest): Promise<TechniqueImage | null> {
  return api
    .get<{ image: TechniqueImage | null }, { image: TechniqueImage | null }>('/api/image', {
      params: request,
      timeout: IMAGE_TIMEOUT_MS,
    })
    .then((response) => response.image);
}
