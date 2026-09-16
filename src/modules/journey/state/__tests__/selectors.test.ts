import type { Journey, JourneyTechnique, PracticeEntry, TechniqueStatus } from '../../types';
import {
  currentTechnique,
  formatMinutes,
  heatLevel,
  masteryOf,
  minutesSince,
  practiceGrid,
  startOfWeek,
} from '../selectors';

function entry(id: string, status: TechniqueStatus): JourneyTechnique {
  return {
    id,
    title: id,
    summary: '',
    medium: 'practice',
    mediumReason: '',
    explainer: '',
    visual: null,
    drill: { task: '', minutes: 10 },
    masteryCheck: '',
    status,
    statusChangedAt: null,
    struckReason: null,
    replacedById: null,
  };
}

function journeyWith(statuses: TechniqueStatus[]): Journey {
  return {
    id: 'j',
    createdAt: '',
    profile: { hobby: 'chess', level: 'new', target: 'x', motivation: '', weeklyHours: 'light' },
    meta: { hobby: 'Chess', goal: 'x' },
    techniques: statuses.map((status, index) => entry(`t${index}`, status)),
    practice: [],
  };
}

/** Local-time date, so the tests hold in any timezone. */
const local = (month: number, day: number, hour = 12) => new Date(2026, month - 1, day, hour);
const log = (date: Date, minutes: number): PracticeEntry => ({
  techniqueId: 't0',
  minutes,
  loggedAt: date.toISOString(),
});

describe('masteryOf', () => {
  it('leaves struck techniques out of the percentage', () => {
    expect(masteryOf(journeyWith(['mastered', 'struck', 'todo', 'struck']))).toEqual({
      mastered: 1,
      toGo: 1,
      struck: 2,
      percent: 50,
    });
  });

  it('is zero rather than NaN when everything is struck', () => {
    expect(masteryOf(journeyWith(['struck'])).percent).toBe(0);
  });
});

describe('currentTechnique', () => {
  it('skips mastered and struck techniques', () => {
    expect(currentTechnique(journeyWith(['mastered', 'struck', 'todo', 'todo']))?.id).toBe('t2');
  });

  it('is null once nothing is left to do', () => {
    expect(currentTechnique(journeyWith(['mastered', 'struck']))).toBeNull();
  });
});

describe('weeks', () => {
  it('starts the week on Monday, including when today is Sunday', () => {
    // 20 September 2026 is a Sunday.
    expect(startOfWeek(local(9, 20))).toEqual(new Date(2026, 8, 14));
    expect(startOfWeek(local(9, 14, 0))).toEqual(new Date(2026, 8, 14));
  });

  it('counts only practice from the start of the week', () => {
    const practice = [log(local(9, 13, 23), 30), log(local(9, 14, 8), 20), log(local(9, 16), 15)];

    expect(minutesSince(practice, startOfWeek(local(9, 16)))).toBe(35);
  });
});

describe('practiceGrid', () => {
  // Wednesday 16 September 2026.
  const today = local(9, 16);

  it('lays out seven weeks, ending with the current one', () => {
    const grid = practiceGrid([], today);

    expect(grid).toHaveLength(7);
    expect(grid.every((week) => week.length === 7)).toBe(true);
  });

  it('sums a day and leaves the days after today blank', () => {
    const grid = practiceGrid([log(local(9, 16, 9), 10), log(local(9, 16, 20), 25)], today);
    const thisWeek = grid[6];

    expect(thisWeek).toEqual([0, 0, 35, null, null, null, null]);
  });
});

describe('formatting', () => {
  it('shades by session length', () => {
    expect([0, 10, 30, 60].map(heatLevel)).toEqual([0, 1, 2, 3]);
  });

  it('reads as hours and minutes', () => {
    expect([0, 45, 60, 130].map(formatMinutes)).toEqual(['0m', '45m', '1h', '2h 10m']);
  });
});
