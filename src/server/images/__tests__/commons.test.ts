/** @jest-environment node */
import { creditOf, inTitleOrder, isCommonsFileUrl, toCandidates } from '../commons';
import { leadImageTitles } from '../wikipedia';

type Info = Record<string, unknown>;

/** One search result shaped like the Commons API's, with sensible defaults. */
function page(index: number, info: Info = {}, metadata: Record<string, string> = {}) {
  return {
    index,
    title: `File:${index}.jpg`,
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

  it('keeps every usable file, so filtering for relevance still has enough to choose from', () => {
    const pages = Array.from({ length: 10 }, (_, index) => page(index + 1));
    expect(toCandidates(payload(...pages))).toHaveLength(10);
  });

  it('keeps the file title, which is what relevance is judged on', () => {
    expect(toCandidates(payload(page(1)))[0].title).toBe('File:1.jpg');
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

  it('takes the name out of the "no machine-readable author" notice', () => {
    // The Artist field of File:Chef's knife grip.jpg, verbatim.
    const artist =
      'No machine-readable author provided. <a href="//commons.wikimedia.org/w/index.php?title=User:BenFrantzDale~commonswiki&amp;action=edit&amp;redlink=1" class="new" title="User:BenFrantzDale~commonswiki (page does not exist)">BenFrantzDale~commonswiki</a> assumed (based on copyright claims).';
    expect(creditOf(artist, 'CC BY-SA 3.0')).toBe('BenFrantzDale');
  });

  it('shortens a long credit at a word boundary', () => {
    const artist = 'Photographed by the volunteer members of a regional woodworking guild during their annual open workshop weekend';
    const credit = creditOf(artist, 'CC BY 4.0');
    expect(credit.length).toBeLessThanOrEqual(81);
    expect(credit.endsWith('…')).toBe(true);
    expect(artist.startsWith(credit.slice(0, -1))).toBe(true);
    expect(credit.slice(0, -1)).toMatch(/\S$/);
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

describe('inTitleOrder', () => {
  it('orders looked-up files as they were asked for, skipping any Commons does not have', () => {
    const ordered = inTitleOrder(payload(page(0, {}), { title: 'File:2.jpg' }, { ...page(0), title: 'File:1.jpg' }), [
      'File:1.jpg',
      'File:Missing.jpg',
      'File:0.jpg',
    ]);

    expect(toCandidates(ordered).map((candidate) => candidate.title)).toEqual(['File:1.jpg', 'File:0.jpg']);
  });
});

describe('leadImageTitles', () => {
  it("lists each article's lead picture as a Commons file title, best article first", () => {
    const search = {
      query: {
        pages: [
          { index: 2, title: 'Asana', pageimage: 'Asanas_Composite.jpg' },
          { index: 1, title: 'Virabhadrasana', pageimage: 'Virabhadrasana_I_-_Warrior_Pose_I.jpg' },
          { index: 3, title: 'List of asanas' },
        ],
      },
    };

    expect(leadImageTitles(search)).toEqual(['File:Virabhadrasana I - Warrior Pose I.jpg', 'File:Asanas Composite.jpg']);
  });

  it('treats an empty or malformed response as no pictures', () => {
    expect(leadImageTitles({})).toEqual([]);
    expect(leadImageTitles(null)).toEqual([]);
  });
});
