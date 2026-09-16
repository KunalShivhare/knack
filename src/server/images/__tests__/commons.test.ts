/** @jest-environment node */
import { creditOf, isCommonsFileUrl, toCandidates } from '../commons';

type Info = Record<string, unknown>;

/** One search result shaped like the Commons API's, with sensible defaults. */
function page(index: number, info: Info = {}, metadata: Record<string, string> = {}) {
  return {
    index,
    imageinfo: [
      {
        mime: 'image/jpeg',
        width: 1200,
        height: 900,
        thumburl: `https://upload.wikimedia.org/thumb/${index}.jpg`,
        thumbwidth: 480,
        thumbheight: 360,
        descriptionurl: `https://commons.wikimedia.org/wiki/File:${index}.jpg`,
        extmetadata: Object.fromEntries(
          Object.entries({ LicenseShortName: 'CC BY-SA 4.0', Artist: 'Jane Doe', ...metadata }).map(
            ([key, value]) => [key, { value }],
          ),
        ),
        ...info,
      },
    ],
  };
}

const payload = (...pages: unknown[]) => ({ query: { pages } });

describe('toCandidates', () => {
  it('orders results by search rank, not by the order the API lists them', () => {
    const candidates = toCandidates(payload(page(3), page(1), page(2)));

    expect(candidates.map((candidate) => candidate.sourceUrl)).toEqual([
      'https://commons.wikimedia.org/wiki/File:1.jpg',
      'https://commons.wikimedia.org/wiki/File:2.jpg',
      'https://commons.wikimedia.org/wiki/File:3.jpg',
    ]);
  });

  it('keeps only files the app can draw and credit', () => {
    const candidates = toCandidates(
      payload(
        page(1, { mime: 'image/gif' }),
        page(2, {}, { LicenseShortName: '' }),
        page(3, { thumburl: undefined }),
        page(4),
      ),
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0].thumbUrl).toContain('/4.jpg');
  });

  it('drops tiny photos and strips, but keeps a small SVG because it scales', () => {
    const candidates = toCandidates(
      payload(
        page(1, { width: 200, height: 150 }),
        page(2, { thumbwidth: 480, thumbheight: 120 }),
        page(3, { mime: 'image/svg+xml', width: 200, height: 160, thumbheight: 384 }),
      ),
    );

    expect(candidates.map((candidate) => candidate.thumbUrl)).toEqual(['https://upload.wikimedia.org/thumb/3.jpg']);
  });

  it('shows the model six candidates at most', () => {
    const pages = Array.from({ length: 10 }, (_, index) => page(index + 1));
    expect(toCandidates(payload(...pages))).toHaveLength(6);
  });

  it('treats an empty or malformed response as no results', () => {
    expect(toCandidates({})).toEqual([]);
    expect(toCandidates(null)).toEqual([]);
  });
});

describe('creditOf', () => {
  it('reduces the HTML author field to a name', () => {
    const artist = '<a href="//commons.wikimedia.org/wiki/User:Mjchael" title="User:Mjchael">user:Mjchael</a>';
    expect(creditOf(artist, 'CC BY-SA 3.0')).toBe('Mjchael');
  });

  it('removes a licence URL and a repeat of the licence name', () => {
    const artist = 'en:User:Cburnett, CC BY-SA 3.0 &lt; http://creativecommons.org/licenses/by-sa/3.0/ &gt;';
    expect(creditOf(artist, 'CC BY-SA 3.0')).toBe('Cburnett');
  });

  it('falls back to a generic credit when no author is given', () => {
    expect(creditOf(undefined, 'CC0')).toBe('Wikimedia Commons contributor');
  });
});

describe('isCommonsFileUrl', () => {
  it('allows files on the two Commons file hosts over https', () => {
    expect(isCommonsFileUrl('https://upload.wikimedia.org/wikipedia/commons/8/85/Posture.jpg')).toBe(true);
    expect(isCommonsFileUrl('https://thumb.wikimedia.org/wikipedia/commons/thumb/a/b/Em.svg/500px-Em.svg.png')).toBe(true);
  });

  it('refuses everything else, so the file route is not an open proxy', () => {
    expect(isCommonsFileUrl('http://upload.wikimedia.org/x.jpg')).toBe(false);
    expect(isCommonsFileUrl('https://upload.wikimedia.org.evil.com/x.jpg')).toBe(false);
    expect(isCommonsFileUrl('https://example.com/?u=https://upload.wikimedia.org/x.jpg')).toBe(false);
    expect(isCommonsFileUrl('file:///etc/passwd')).toBe(false);
    expect(isCommonsFileUrl('not a url')).toBe(false);
    expect(isCommonsFileUrl(null)).toBe(false);
  });
});
