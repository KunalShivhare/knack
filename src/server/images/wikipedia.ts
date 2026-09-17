import { USER_AGENT, commonsFiles, type Candidate } from './commons';

const API_URL = 'https://en.wikipedia.org/w/api.php';

/** Articles whose lead picture is considered; past the first few, the article is rarely about the technique. */
const ARTICLES = 3;

/**
 * The lead pictures of the Wikipedia articles that best match `query`.
 *
 * A named technique usually has an article, and its lead picture is chosen by
 * editors to show exactly that: "warrior one yoga pose" finds Virabhadrasana,
 * led by a photo of the pose, where a Commons file search finds crowds and
 * military "Warrior Games" shots. Only free pictures, which live on Commons, are
 * taken. A second source, so a failure here costs these candidates and nothing
 * else.
 */
export async function wikipediaLeadImages(query: string, signal: AbortSignal): Promise<Candidate[]> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: String(ARTICLES),
    prop: 'pageimages',
    piprop: 'name',
    pilicense: 'free',
  });

  try {
    const response = await fetch(`${API_URL}?${params}`, { headers: { 'User-Agent': USER_AGENT }, signal });
    if (!response.ok) return [];

    return await commonsFiles(leadImageTitles(await response.json()), signal);
  } catch (error) {
    if (signal.aborted) throw error;
    return [];
  }
}

/** Each matching article's lead picture as a Commons file title, best-matching article first. */
export function leadImageTitles(payload: unknown): string[] {
  const pages = (payload as { query?: { pages?: { index?: number; pageimage?: string }[] } })?.query?.pages ?? [];

  return pages
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .flatMap((page) => (page.pageimage ? [`File:${page.pageimage.replace(/_/g, ' ')}`] : []));
}
