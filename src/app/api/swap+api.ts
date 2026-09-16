import { SwapRequestSchema } from '@/shared/contracts/schemas';

import { toPlanError } from '@/server/errors';
import { swapTechnique } from '@/server/swapTechnique';

const TIMEOUT_MS = 45_000;

/** POST /api/swap — one replacement for a struck technique. */
export async function POST(request: Request): Promise<Response> {
  const swap = SwapRequestSchema.safeParse(await request.json().catch(() => null));

  if (!swap.success) {
    return Response.json({ message: "That swap request isn't valid." }, { status: 400 });
  }

  try {
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(TIMEOUT_MS)]);
    const technique = await swapTechnique(swap.data, signal);

    return Response.json({ technique });
  } catch (error) {
    const { code, message } = toPlanError(error);
    // 503 says "try again later"; 502 says the upstream answer was unusable.
    return Response.json({ code, message }, { status: code === 'busy' ? 503 : 502 });
  }
}
