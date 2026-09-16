import { ImageRequestSchema } from '@/shared/contracts/schemas';

import { toPlanError } from '@/server/errors';
import { findImage } from '@/server/findImage';

/** Search, six downloads and one model call; a slow Commons day still fits. */
const TIMEOUT_MS = 30_000;

/**
 * GET /api/image — a picture for one technique, or `{ image: null }`.
 *
 * A GET so the answer can be cached: the same technique asked for twice, from
 * any device, is served by the CDN without searching or calling the model again.
 */
export async function GET(request: Request): Promise<Response> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = ImageRequestSchema.safeParse(params);

  if (!parsed.success) {
    return Response.json({ message: "That image request isn't valid." }, { status: 400 });
  }

  try {
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(TIMEOUT_MS)]);
    const image = await findImage(parsed.data, signal);

    return Response.json(
      { image },
      // A week at the edge; browsers always ask again, and the app keeps its own copy.
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=604800, stale-while-revalidate=86400' } },
    );
  } catch (error) {
    const { code, message } = toPlanError(error);
    return Response.json(
      { code, message },
      { status: code === 'busy' ? 503 : 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
