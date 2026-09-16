import { fetchCommonsFile, isCommonsFileUrl } from '@/server/images/commons';

const TIMEOUT_MS = 15_000;

/** Thumbnails are well under this; anything larger is not what the app asked for. */
const MAX_BYTES = 5_000_000;

/**
 * GET /api/image-file?src=… — a picture's bytes, fetched from Wikimedia Commons.
 *
 * The app cannot load these directly on Android: Wikimedia answers its image
 * loader's user agent with a 403, and the loader ignores the header that would
 * fix it. Only Commons file URLs are fetched, so this is not an open proxy, and
 * the files never change, so the CDN keeps them for a month.
 */
export async function GET(request: Request): Promise<Response> {
  const src = new URL(request.url).searchParams.get('src');

  if (!isCommonsFileUrl(src)) {
    return Response.json({ message: 'Only Wikimedia Commons files can be fetched.' }, { status: 400 });
  }

  try {
    const upstream = await fetchCommonsFile(src, AbortSignal.any([request.signal, AbortSignal.timeout(TIMEOUT_MS)]));
    const type = upstream.headers.get('content-type') ?? '';
    const length = Number(upstream.headers.get('content-length') ?? 0);

    if (upstream.status !== 200 || !type.startsWith('image/') || length > MAX_BYTES || !upstream.body) {
      return Response.json({ message: 'That file could not be fetched.' }, { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000, immutable',
      },
    });
  } catch {
    return Response.json({ message: 'That file could not be fetched.' }, { status: 502 });
  }
}
