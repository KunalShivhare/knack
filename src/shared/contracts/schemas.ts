import { z } from 'zod';

import { LEVEL_IDS, MEDIUMS, STRIKE_REASONS, TIME_BUDGET_IDS } from './constants';

/*
 * The plan contract. The API routes validate requests and model output against
 * these schemas, the model is handed a JSON Schema generated from them, and the
 * app types its store from them — one definition, three consumers, so the three
 * cannot drift apart.
 *
 * Server-side only at runtime: the app imports these as types, which compile
 * away, so zod never reaches the app bundle.
 */

/**
 * What the model is told about the learner. The name is absent on purpose: the
 * plan does not need it, and free-tier prompts may be read to train models.
 * Lengths are capped because these strings are user input going into a prompt.
 */
export const LearnerProfileSchema = z.object({
  hobby: z.string().trim().min(1).max(60),
  level: z.enum(LEVEL_IDS),
  target: z.string().trim().min(1).max(160),
  motivation: z.string().trim().max(400),
  weeklyHours: z.enum(TIME_BUDGET_IDS),
});

export type LearnerProfile = z.infer<typeof LearnerProfileSchema>;

const shortText = (max: number) => z.string().min(1).max(max);

/** Longest list each infographic kind can lay out; longer ones are trimmed, not rejected. */
export const VISUAL_MAX = { steps: 6, points: 4, items: 4 } as const;

/**
 * An infographic the app draws from data the model supplies. A fixed set of
 * shapes rather than free-form drawing: every one renders cleanly in the app's
 * own style, and the model's only job is to pick the shape that fits the idea.
 *
 * The bounds are what the layouts can draw, not the prompt's style guide (three
 * to six steps and so on). Array bounds cannot be sent to Gemini, so the model
 * only has the prompt to go on and sometimes writes two steps; that still draws
 * fine, and rejecting it would cost the learner the whole technique.
 */
export const VisualSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('steps'),
      title: shortText(60),
      steps: z
        .array(z.object({ label: shortText(60), detail: shortText(160) }))
        .min(2)
        .max(VISUAL_MAX.steps),
    })
    .describe('An ordered sequence: how a movement, routine or process unfolds.'),
  z
    .object({
      kind: z.literal('compare'),
      title: shortText(60),
      left: z.object({ heading: shortText(30), points: z.array(shortText(120)).min(1).max(VISUAL_MAX.points) }),
      right: z.object({ heading: shortText(30), points: z.array(shortText(120)).min(1).max(VISUAL_MAX.points) }),
    })
    .describe('Two sides set against each other: do versus avoid, or one option versus another.'),
  z
    .object({
      kind: z.literal('numbers'),
      title: shortText(60),
      items: z
        .array(z.object({ value: shortText(16), label: shortText(80) }))
        .min(1)
        .max(VISUAL_MAX.items),
    })
    .describe('The few figures worth remembering, such as a ratio, a tempo or a count.'),
]);

export type Visual = z.infer<typeof VisualSchema>;

export const TechniqueSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(60)
      .describe('Short kebab-case slug.'),
    title: z.string().min(1).max(60).describe('The technique, at most six words.'),
    summary: z
      .string()
      .min(1)
      .max(200)
      .describe('One sentence starting with a verb: what the learner can do afterwards.'),
    medium: z
      .enum(MEDIUMS)
      .describe('The one medium this technique is best learned through.'),
    mediumReason: z
      .string()
      .min(1)
      .max(300)
      .describe('One sentence tying the medium to the nature of this technique.'),
    explainer: z
      .string()
      .min(1)
      .max(1500)
      .describe('60 to 150 words of plain text teaching the core idea, in second person.'),
    visual: VisualSchema.nullable().describe(
      'An infographic for the technique. Required when the medium is visual; otherwise include one only if it genuinely clarifies the idea, else null.',
    ),
    imageQuery: z
      .string()
      .min(1)
      .max(80)
      .nullable()
      .describe(
        'A short Wikimedia Commons search phrase for a tutorial picture of the exact physical action, or null when words and the infographic are enough.',
      ),
    drill: z.object({
      task: z.string().min(1).max(400).describe('One concrete, measurable exercise.'),
      minutes: z.number().int().min(5).max(60).describe('Length of one drill session.'),
    }),
    masteryCheck: z
      .string()
      .min(1)
      .max(300)
      .describe('An observable test, starting "You\'ve got it when".'),
  })
  .refine((technique) => technique.medium !== 'visual' || technique.visual !== null, {
    message: 'A visual technique needs a visual.',
    path: ['visual'],
  });

export type Technique = z.infer<typeof TechniqueSchema>;

export const PlanMetaSchema = z.object({
  hobby: z.string().min(1).max(60).describe('The hobby as a short display name.'),
  goal: z.string().min(1).max(160).describe("The learner's target, restated as a short goal."),
});

export type PlanMeta = z.infer<typeof PlanMetaSchema> & {
  /**
   * One emoji for the hobby, so a hobby the app has no emoji for still gets a
   * mark. `null` when the model's answer was not a single emoji; absent on plans
   * saved before it was asked for.
   */
  emoji?: string | null;
};

/** The whole plan as the model produces it. `count` comes from the time budget. */
export function planSchema(count: number) {
  return PlanMetaSchema.extend({
    emoji: z.string().describe('One emoji that stands for the hobby itself, such as 🧘 for yoga.'),
    techniques: z.array(TechniqueSchema).min(count).max(count),
  });
}

/**
 * The plan route streams newline-delimited JSON, one event per line, so each
 * technique can be shown the moment the model finishes writing it.
 */
export type PlanStreamEvent =
  | { type: 'technique'; technique: Technique }
  | { type: 'done'; meta: PlanMeta }
  | { type: 'error'; code: PlanErrorCode; message: string };

export type PlanErrorCode = 'busy' | 'invalid' | 'failed';

export const SwapRequestSchema = z.object({
  profile: LearnerProfileSchema,
  /** Titles of every technique currently in the plan, in order, struck ones included. */
  planTitles: z.array(z.string().min(1).max(60)).min(1).max(24),
  struck: z.object({ title: z.string().min(1).max(60), summary: z.string().min(1).max(200) }),
  reason: z.enum(STRIKE_REASONS),
});

export type SwapRequest = z.infer<typeof SwapRequestSchema>;

/**
 * What the image route needs to find a picture for a technique. Sent as query
 * parameters, because the route is a GET whose answers the CDN caches.
 */
export const ImageRequestSchema = z.object({
  hobby: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(60),
  summary: z.string().trim().min(1).max(200),
  /** The technique's search phrase. Techniques without one never ask for a picture. */
  query: z.string().trim().min(1).max(80),
});

export type ImageRequest = z.infer<typeof ImageRequestSchema>;

/** A picture for a technique, with what its licence requires be shown alongside it. */
export type TechniqueImage = {
  url: string;
  width: number;
  height: number;
  /** One line telling the learner what to look at. */
  caption: string;
  credit: string;
  license: string;
  /** The file's page on Wikimedia Commons, where its full licence lives. */
  sourceUrl: string;
};
