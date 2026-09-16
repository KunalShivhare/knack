import { z } from 'zod';

import type { ImageRequest } from '@/shared/contracts';

import { toModelSchema, type JsonPrompt } from '../llm';
import { clean, dataRule } from './coach';

/**
 * The model's verdict, image by image and then overall. Judging each image
 * against the criteria before choosing makes the choice follow them, and gives
 * the server something to hold the choice to: a pick the model itself marked as
 * generic or unsuitable is thrown out.
 */
export const ImageChoiceSchema = z.object({
  images: z
    .array(
      z.object({
        number: z.number().int().describe('The image number, from 1.'),
        safe: z.boolean().describe('Suitable for a general audience of all ages.'),
        demonstrates: z
          .boolean()
          .describe('Shows the exact action, position or arrangement this technique teaches, clearly enough to copy.'),
        generic: z.boolean().describe('Mainly shows the hobby in general rather than teaching this step.'),
      }),
    )
    .describe('One verdict per image, in order.'),
  pick: z
    .number()
    .int()
    .nullable()
    .describe('The number of the best image that is safe, demonstrates the technique and is not generic, or null.'),
  caption: z
    .string()
    .max(160)
    .describe('One sentence telling the learner exactly what to copy from the picked image; empty when pick is null.'),
});

const SYSTEM = `You choose the tutorial picture for one technique in a hobby lesson. You are shown numbered images found on Wikimedia Commons. The picture is only worth showing if a learner could copy the technique from it.

Judge every image on its own first:
- safe: false if it shows nudity, underwear, lingerie or swimwear as the focus, a sexualised pose, violence, gore, or anything unsuitable for a general audience of all ages.
- demonstrates: true only if it shows the exact action, position, grip, shape or arrangement this technique teaches, done correctly, with the key detail clearly visible and large enough to copy, the way a tutorial or instruction manual would. A diagram or instructional illustration of it counts. A different technique or variation, or the technique too small, cropped or seen from an angle that hides it, does not.
- generic: true if it mainly shows the hobby in general rather than teaching this step: a group or class, a performance or event, a portrait, fashion or artistic shot, equipment on its own, or a scene where the technique is incidental.

Then pick the number of the best image that is safe, demonstrates the technique and is not generic, or null if none qualifies. When in doubt, choose null: no picture is better than a generic or unsuitable one.

caption: one sentence of at most 20 words telling the learner exactly what to copy from the picked image, describing only what is visible in it. Empty when pick is null.

${dataRule(['technique'])}`;

/** Asks which of `count` images, sent after the prompt in order, teaches the technique. */
export function imagePrompt(request: ImageRequest, count: number): JsonPrompt {
  return {
    name: 'image_choice',
    system: SYSTEM,
    user: `<technique>
hobby: ${clean(request.hobby)}
title: ${clean(request.title)}
summary: ${clean(request.summary)}
</technique>

The ${count} images follow in order, numbered 1 to ${count}.`,
    schema: toModelSchema(ImageChoiceSchema),
  };
}
