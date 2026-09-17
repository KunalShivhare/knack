import type { InlineImage } from '../llm';

const API_URL = 'https://commons.wikimedia.org/w/api.php';

/**
 * Wikimedia refuses requests from generic clients: a file fetched with no user
 * agent, or Android's default one, gets a 403. Automated clients are asked to
 * name themselves and give a contact.
 */
export const USER_AGENT = 'Knack/1.0 (https://github.com/KunalShivhare/knack)';

/** Where Commons serves files from. The file route fetches from nowhere else. */
const FILE_HOSTS = new Set(['upload.wikimedia.org', 'thumb.wikimedia.org']);

/** Enough results to survive filtering; `MAX_CANDIDATES` caps what the model looks at, across all searches. */
const SEARCH_LIMIT = 10;
export const MAX_CANDIDATES = 6;

/** Wide enough for a phone at 2x and a desktop sheet, small enough to send six to the model. */
const THUMB_WIDTH = 480;

/** Types the app can draw everywhere. SVGs qualify because Commons serves them as PNG thumbnails. */
const ACCEPTED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

/** Photos smaller than this are icons or crops; SVGs scale, so they are exempt. */
const MIN_BITMAP_SIDE = 240;

/** Strips and banners cannot show a technique at phone width. */
const MAX_ASPECT = 2.5;

/** A thumbnail larger than this is not a thumbnail. */
const MAX_DOWNLOAD_BYTES = 1_500_000;

export type Candidate = {
  /** The Commons file title, "File:…". Its words are what relevance is judged on. */
  title: string;
  thumbUrl: string;
  width: number;
  height: number;
  credit: string;
  license: string;
  sourceUrl: string;
};

/** What every candidate needs to know about its file, as Commons API parameters. */
const IMAGE_INFO = {
  prop: 'imageinfo',
  iiprop: 'url|mime|size|extmetadata',
  iiurlwidth: String(THUMB_WIDTH),
  iiextmetadatafilter: 'LicenseShortName|Artist',
};

/** Files on Wikimedia Commons matching `query`, best match first, already filtered to usable ones. */
export async function searchCommons(query: string, signal: AbortSignal): Promise<Candidate[]> {
  return toCandidates(
    await commonsQuery(
      {
        generator: 'search',
        gsrnamespace: '6', // the File namespace
        gsrlimit: String(SEARCH_LIMIT),
        gsrsearch: `${query} filetype:bitmap|drawing`,
      },
      signal,
    ),
  );
}

/** Named Commons files as candidates, in the order given; files Commons does not hold are skipped. */
export async function commonsFiles(titles: string[], signal: AbortSignal): Promise<Candidate[]> {
  if (titles.length === 0) return [];
  return toCandidates(inTitleOrder(await commonsQuery({ titles: titles.join('|') }, signal), titles));
}

async function commonsQuery(params: Record<string, string>, signal: AbortSignal): Promise<unknown> {
  const query = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', ...IMAGE_INFO, ...params });
  const response = await fetch(`${API_URL}?${query}`, { headers: { 'User-Agent': USER_AGENT }, signal });

  if (!response.ok) throw new Error(`Wikimedia Commons responded ${response.status}.`);
  return response.json();
}

/**
 * A lookup by title answers in no particular order, so each page is given the
 * position its title was asked for, the way search results carry their rank.
 */
export function inTitleOrder(payload: unknown, titles: string[]): { query: { pages: CommonsPage[] } } {
  const pages = (payload as { query?: { pages?: CommonsPage[] } })?.query?.pages ?? [];
  const byTitle = new Map(pages.map((page) => [page.title, page]));

  return {
    query: {
      pages: titles.flatMap((title, index) => {
        const page = byTitle.get(title);
        return page ? [{ ...page, index }] : [];
      }),
    },
  };
}

type CommonsPage = {
  index?: number;
  title?: string;
  imageinfo?: {
    mime?: string;
    width?: number;
    height?: number;
    thumburl?: string;
    thumbwidth?: number;
    thumbheight?: number;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string } | undefined>;
  }[];
};

/**
 * Keeps the results the app can show and attribute. A file without a licence
 * name is dropped rather than shown uncredited: the licences Commons uses
 * require the credit.
 */
export function toCandidates(payload: unknown): Candidate[] {
  const pages = ((payload as { query?: { pages?: CommonsPage[] } })?.query?.pages ?? [])
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const candidates: Candidate[] = [];

  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!page.title || !info?.mime || !ACCEPTED_MIME.has(info.mime)) continue;
    if (!info.thumburl || !info.thumbwidth || !info.thumbheight || !info.descriptionurl) continue;

    const license = plainText(info.extmetadata?.LicenseShortName?.value);
    if (!license) continue;

    const bitmap = info.mime !== 'image/svg+xml';
    if (bitmap && Math.min(info.width ?? 0, info.height ?? 0) < MIN_BITMAP_SIDE) continue;

    const aspect = info.thumbwidth / info.thumbheight;
    if (aspect > MAX_ASPECT || aspect < 1 / MAX_ASPECT) continue;

    candidates.push({
      title: page.title,
      thumbUrl: info.thumburl,
      width: info.thumbwidth,
      height: info.thumbheight,
      credit: creditOf(info.extmetadata?.Artist?.value, license),
      license,
      sourceUrl: info.descriptionurl,
    });
  }

  return candidates;
}

/** A thumbnail as model input, or `null` if it could not be fetched as a reasonably sized image. */
export async function downloadThumbnail(url: string, signal: AbortSignal): Promise<InlineImage | null> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal });
    const mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';
    if (!response.ok || !mimeType.startsWith('image/')) return null;

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_DOWNLOAD_BYTES) return null;

    return { mimeType, data: toBase64(bytes) };
  } catch (error) {
    if (signal.aborted) throw error;
    return null; // One unreachable file should not cost the others.
  }
}

/** Whether `src` is a Commons file URL, the only kind the app's file route will fetch. */
export function isCommonsFileUrl(src: string | null): src is string {
  if (!src) return false;

  try {
    const url = new URL(src);
    return url.protocol === 'https:' && FILE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Fetches a Commons file on the app's behalf. Redirects are refused rather than
 * followed, so an allowed URL can never lead the server somewhere else.
 */
export function fetchCommonsFile(src: string, signal: AbortSignal): Promise<Response> {
  return fetch(src, { headers: { 'User-Agent': USER_AGENT }, redirect: 'manual', signal });
}

/** Longest credit shown under a picture; longer ones are cut at a word. */
const MAX_CREDIT = 80;

/**
 * The author as a short name. The field is free text: it often carries a wiki
 * user prefix, a licence URL, or the licence name the app already shows.
 */
export function creditOf(artist: string | undefined, license: string): string {
  const credit = plainText(artist)
    // Commons' own notice for files whose author field was never filled in: keep the name it assumes.
    .replace(/^No machine-readable author provided\.\s*(.*?)\s*assumed \(based on copyright claims\)\.?$/i, '$1')
    .replace(/<?\s*https?:\/\/\S+\s*>?/g, '')
    .replace(/^(?:[a-z]{2,3}:)?user:/i, '')
    // Accounts merged across wikis carry a "~commonswiki" suffix nobody signs with.
    .replace(/~commonswiki\b/gi, '')
    .replace(new RegExp(`[,;\\s]*${license.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'), '')
    .replace(/[,;\s]+$/, '')
    .trim();

  return shorten(credit, MAX_CREDIT) || 'Wikimedia Commons contributor';
}

/** Cut after cleaning, not before: cutting first left half a notice behind ("assumed (based on"). */
function shorten(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

/** Commons metadata is HTML ("<a href=…>user:Name</a>"); the app shows text. */
export function plainText(html: string | undefined): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Chunked, because spreading a whole image into `String.fromCharCode` overflows the call stack. */
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}
