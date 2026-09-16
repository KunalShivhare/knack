import type { PlanStreamEvent } from '@/shared/contracts';
import { LearnerProfileSchema } from '@/shared/contracts/schemas';

import { toPlanError } from '@/server/errors';
import { generatePlan } from '@/server/generatePlan';

/** Generous for a streamed call; a plan normally finishes well inside it. */
const TIMEOUT_MS = 90_000;

/**
 * POST /api/plans — streams a plan as newline-delimited JSON.
 *
 * The status is sent before generation starts, so a failure part-way through
 * cannot become an HTTP error; it arrives as a final `error` event instead,
 * after whatever techniques were already sent.
 */
export async function POST(request: Request): Promise<Response> {
  const profile = LearnerProfileSchema.safeParse(await request.json().catch(() => null));

  if (!profile.success) {
    return Response.json({ message: 'Those answers are incomplete.' }, { status: 400 });
  }

  // Stops paying for tokens nobody will read when the app goes away mid-plan.
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(TIMEOUT_MS)]);
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: PlanStreamEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        for await (const event of generatePlan(profile.data, signal)) send(event);
      } catch (error) {
        // A timeout still gets an error event; a disconnected app has nobody to send it to.
        if (!request.signal.aborted) send({ type: 'error', ...toPlanError(error) });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed by the app disconnecting.
        }
      }
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      // Stops proxies that buffer responses from holding techniques back.
      'X-Accel-Buffering': 'no',
    },
  });
}
