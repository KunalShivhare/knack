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

/**
 * Glyphs for hobbies people type rather than pick: every hobby the welcome
 * drift advertises, so one shown there never turns into a bare initial later.
 */
const HOBBY_EMOJI = new Map<string, string>([
  ...HOBBY_SUGGESTIONS.map((option): [string, string] => [option.id, option.emoji ?? '']),
  ['reading', '📖'],
  ['books', '📖'],
  ['knitting', '🧶'],
  ['crochet', '🧶'],
  ['gardening', '🪴'],
  ['coffee', '☕'],
  ['violin', '🎻'],
  ['skateboarding', '🛹'],
  ['piano', '🎹'],
  ['sewing', '🧵'],
  ['embroidery', '🧵'],
  ['surfing', '🏄'],
  ['cycling', '🚴'],
  ['baking', '🍞'],
  ['sourdough', '🍞'],
  ['archery', '🏹'],
  ['boxing', '🥊'],
  ['darts', '🎯'],
]);

export type HobbyExamples = { goal: string; why: string };

/**
 * Placeholder answers for the goal and motivation fields. An example about a
 * different hobby teaches the wrong thing, so each suggestion has its own and
 * anything else gets one that holds for any hobby. Goals stay short enough to
 * fit the single-line field on a phone.
 */
const HOBBY_EXAMPLES = new Map<string, HobbyExamples>([
  ['chess', { goal: 'Win a game without a blunder', why: 'My friend beats me every weekend and I want that to stop.' }],
  ['guitar', { goal: 'Play a full song start to finish', why: "I want to play at my sister's wedding in March." }],
  ['poker', { goal: 'Finish a home game up, not down', why: 'Friday games with friends keep costing me money.' }],
  ['photography', { goal: 'Take portraits worth framing', why: 'I bought a camera and only ever use auto.' }],
  ['drawing', { goal: 'Sketch a face that looks like them', why: 'I drew all the time as a kid and want it back.' }],
  ['cooking', { goal: 'Cook dinner for six, no recipe', why: "I'm hosting my family for the holidays." }],
  ['running', { goal: 'Run 5 km without stopping', why: "There's a charity 5K in October." }],
  ['pottery', { goal: 'Throw four matching mugs', why: 'I want to make gifts instead of buying them.' }],
]);

const ANY_HOBBY_EXAMPLES: HobbyExamples = {
  goal: "Finish one thing I'm proud of",
  why: "I want something to do that isn't a screen.",
};

/**
 * Matched word by word, so "Bread baking" and "speed reading" find theirs
 * while "bread" never matches "read". A Map, because a plain object would
 * answer a hobby called "constructor".
 */
function findByWord<T>(hobby: string, table: ReadonlyMap<string, T>): T | undefined {
  for (const word of hobby.toLowerCase().split(/[^a-z]+/)) {
    const hit = table.get(word);
    if (hit) return hit;
  }
  return undefined;
}

/** The glyph for a hobby, picked or typed; undefined when there is no fitting one. */
export function hobbyEmoji(hobby: string): string | undefined {
  return findByWord(hobby, HOBBY_EMOJI);
}

export function hobbyExamples(hobby: string): HobbyExamples {
  return findByWord(hobby, HOBBY_EXAMPLES) ?? ANY_HOBBY_EXAMPLES;
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
