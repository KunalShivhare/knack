import type { ChipOption } from '@/shared/components/molecules';

import type { DriftingHobby } from './components/molecules/HobbyDrift';
import type { LevelId, TimeBudgetId } from './types';

/**
 * The welcome screen's drifting hobby field.
 *
 * Scattered rather than aligned, at mixed sizes and angles, so it reads as a
 * drift of things and not as a grid. Larger glyphs carry more opacity and sit
 * nearer the centre band; the small faint ones fill the edges.
 *
 * The breadth is the argument: "any hobby" is a claim until archery and
 * sourdough are visibly sitting next to chess.
 */
export const HOBBY_DRIFT: readonly DriftingHobby[] = [
  { emoji: '♟️', x: 0.02, y: 0.34, size: 58, opacity: 0.95, rotate: -8 },
  { emoji: '🧶', x: 0.07, y: 0.72, size: 42, opacity: 0.6, rotate: 12 },
  { emoji: '🎸', x: 0.13, y: 0.08, size: 64, opacity: 1, rotate: 9 },
  { emoji: '📖', x: 0.16, y: 0.55, size: 36, opacity: 0.45, rotate: -5 },
  { emoji: '📷', x: 0.22, y: 0.82, size: 50, opacity: 0.8, rotate: 6 },
  { emoji: '🪴', x: 0.27, y: 0.26, size: 44, opacity: 0.7, rotate: -11 },
  { emoji: '🏃', x: 0.32, y: 0.62, size: 60, opacity: 0.9, rotate: 4 },
  { emoji: '☕', x: 0.37, y: 0.14, size: 34, opacity: 0.5, rotate: 14 },
  { emoji: '🍳', x: 0.42, y: 0.44, size: 52, opacity: 0.85, rotate: -6 },
  { emoji: '🎻', x: 0.47, y: 0.88, size: 40, opacity: 0.55, rotate: 10 },
  { emoji: '🏺', x: 0.52, y: 0.2, size: 54, opacity: 0.9, rotate: -4 },
  { emoji: '🛹', x: 0.57, y: 0.68, size: 38, opacity: 0.5, rotate: 13 },
  { emoji: '🎹', x: 0.62, y: 0.38, size: 62, opacity: 1, rotate: 7 },
  { emoji: '🧵', x: 0.67, y: 0.9, size: 32, opacity: 0.4, rotate: -9 },
  { emoji: '🏄', x: 0.71, y: 0.1, size: 48, opacity: 0.75, rotate: -12 },
  { emoji: '🚴', x: 0.76, y: 0.58, size: 56, opacity: 0.85, rotate: 5 },
  { emoji: '🍞', x: 0.81, y: 0.3, size: 40, opacity: 0.6, rotate: 11 },
  { emoji: '🏹', x: 0.86, y: 0.78, size: 46, opacity: 0.7, rotate: -7 },
  { emoji: '🥊', x: 0.9, y: 0.16, size: 38, opacity: 0.5, rotate: 8 },
  { emoji: '🎯', x: 0.95, y: 0.5, size: 44, opacity: 0.65, rotate: -3 },
] as const;

/**
 * Suggestions, not a menu. The free-text field beside them is the important
 * half — these exist to save typing for the common cases and to show, in one
 * glance, how wide "hobby" is meant to be read.
 */
export const HOBBY_SUGGESTIONS: readonly ChipOption[] = [
  { id: 'chess', label: 'Chess', emoji: '♟️' },
  { id: 'guitar', label: 'Guitar', emoji: '🎸' },
  { id: 'poker', label: 'Poker', emoji: '🃏' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'drawing', label: 'Drawing', emoji: '✏️' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'running', label: 'Running', emoji: '🏃' },
  { id: 'pottery', label: 'Pottery', emoji: '🏺' },
] as const;

/** The suggestion emoji for a hobby typed or picked in onboarding, if it is one of the suggestions. */
export function hobbyEmoji(hobby: string): string | undefined {
  const key = hobby.trim().toLowerCase();
  return HOBBY_SUGGESTIONS.find((option) => option.label.toLowerCase() === key)?.emoji;
}

export type LevelOption = { id: LevelId; label: string; description: string };

export const LEVELS: readonly LevelOption[] = [
  { id: 'new', label: 'Starting from scratch', description: "Never really tried it" },
  { id: 'dabbled', label: 'Dabbled a bit', description: 'Know a few basics, nothing stuck' },
  { id: 'comfortable', label: 'Comfortable', description: 'Can hold my own, plateaued' },
  { id: 'sharp', label: 'Pretty solid', description: 'Want to sharpen the weak spots' },
] as const;

/**
 * Hours a week. This is the direct lever against the overload the brief
 * describes: it decides how many techniques a plan can hold and how big each
 * one is allowed to be.
 */
export const TIME_BUDGETS: readonly { id: TimeBudgetId; label: string }[] = [
  { id: 'light', label: 'Under 2 hrs' },
  { id: 'steady', label: '2–5 hrs' },
  { id: 'serious', label: '5–10 hrs' },
  { id: 'deep', label: '10+ hrs' },
] as const;
