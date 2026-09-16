import { useCallback, useEffect, useState } from 'react';

import type { LearnerProfile, PlanMeta, Technique } from '@/shared/contracts';
import { isApiError } from '@/shared/lib/http';

import { streamPlan } from '../api';

export type PlanStream =
  | { status: 'streaming'; techniques: Technique[] }
  | { status: 'done'; techniques: Technique[]; meta: PlanMeta }
  | { status: 'failed'; techniques: Technique[]; message: string };

const STARTING: PlanStream = { status: 'streaming', techniques: [] };

/**
 * Runs one plan generation for `profile` and exposes its progress.
 *
 * `profile` must be referentially stable — a new object starts a new request.
 * Leaving the screen aborts the request, so the server stops generating a plan
 * nobody will see.
 */
export function usePlanStream(profile: LearnerProfile | null) {
  const [attempt, setAttempt] = useState(0);
  const [stream, setStream] = useState<PlanStream>(STARTING);

  useEffect(() => {
    if (!profile) return;

    const controller = new AbortController();

    streamPlan(
      profile,
      (event) => {
        // An event already in flight when a retry aborted this request belongs to the old attempt.
        if (controller.signal.aborted) return;

        setStream((current) => {
          switch (event.type) {
            case 'technique':
              return { status: 'streaming', techniques: [...current.techniques, event.technique] };
            case 'done':
              return { status: 'done', techniques: current.techniques, meta: event.meta };
            case 'error':
              return { status: 'failed', techniques: current.techniques, message: event.message };
          }
        });
      },
      controller.signal,
    ).catch((error: unknown) => {
      if (controller.signal.aborted) return;

      setStream((current) => ({
        status: 'failed',
        techniques: current.techniques,
        message: isApiError(error) ? error.message : 'Something went wrong. Try again.',
      }));
    });

    return () => controller.abort();
  }, [profile, attempt]);

  const retry = useCallback(() => {
    setStream(STARTING);
    setAttempt((count) => count + 1);
  }, []);

  return { stream, attempt, retry };
}
