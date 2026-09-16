import type { TimeBudgetId } from '@/shared/contracts';

import type { Journey, JourneyTechnique, PracticeEntry } from '../types';

/** The technique the learner is on: the first one neither mastered nor struck. */
export function currentTechnique(journey: Journey): JourneyTechnique | null {
  return journey.techniques.find((technique) => technique.status === 'todo') ?? null;
}

export type Mastery = { mastered: number; toGo: number; struck: number; percent: number };

/**
 * Struck techniques leave the denominator. Striking one out is something the
 * brief asks the app to support, and counting it would make doing so lower the
 * learner's progress.
 */
export function masteryOf(journey: Journey): Mastery {
  let mastered = 0;
  let toGo = 0;
  let struck = 0;

  for (const technique of journey.techniques) {
    if (technique.status === 'mastered') mastered += 1;
    else if (technique.status === 'todo') toGo += 1;
    else struck += 1;
  }

  const inPlay = mastered + toGo;
  return { mastered, toGo, struck, percent: inPlay === 0 ? 0 : Math.round((mastered / inPlay) * 100) };
}

/**
 * The weekly budget from onboarding, in minutes. `max` is what a full week's
 * bar fills to; the top budget has no ceiling, so its floor is used instead.
 */
export const BUDGET_MINUTES: Record<TimeBudgetId, { min: number; max: number | null; label: string }> = {
  light: { min: 0, max: 120, label: 'under 2 hrs' },
  steady: { min: 120, max: 300, label: '2–5 hrs' },
  serious: { min: 300, max: 600, label: '5–10 hrs' },
  deep: { min: 600, max: null, label: '10+ hrs' },
};

/** Monday, 00:00 local time, of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

export function minutesSince(practice: PracticeEntry[], since: Date): number {
  return practice
    .filter((entry) => new Date(entry.loggedAt) >= since)
    .reduce((total, entry) => total + entry.minutes, 0);
}

/**
 * Minutes practised per day over the last `weeks` weeks: one row per week,
 * oldest first, Monday to Sunday. Days after today are `null` so the grid can
 * leave them blank instead of showing them as missed.
 */
export function practiceGrid(practice: PracticeEntry[], now: Date, weeks = 7): (number | null)[][] {
  const totals = new Map<string, number>();
  for (const entry of practice) {
    const key = dayKey(new Date(entry.loggedAt));
    totals.set(key, (totals.get(key) ?? 0) + entry.minutes);
  }

  const today = dayKey(now);
  const first = startOfWeek(now);
  first.setDate(first.getDate() - 7 * (weeks - 1));

  let future = false;
  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const day = new Date(first);
      day.setDate(first.getDate() + week * 7 + weekday);

      if (future) return null;
      const key = dayKey(day);
      if (key === today) future = true;

      return totals.get(key) ?? 0;
    }),
  );
}

/** Four shades: none, a short session, a solid one, a long one. */
export function heatLevel(minutes: number): 0 | 1 | 2 | 3 {
  if (minutes <= 0) return 0;
  if (minutes < 20) return 1;
  if (minutes < 45) return 2;
  return 3;
}

export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
