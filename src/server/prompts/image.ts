import { z } from 'zod';

import type { ImageRequest } from '@/shared/contracts';

import { toModelSchema, type JsonPrompt } from '../llm';
import { clean, dataRule } from './coach';

/** The model's verdict on the candidates, numbered from 1 as it was shown them. */
export const ImageChoiceSchema = z.object({
  pick: z
    .number()
    .int()
    .nullable()
    .describe('The number of the image that best shows the technique, or null if none does.'),
  caption: z
    .string()
    .max(160)
    .describe('One sentence telling the learner what to notice in the picked image; empty when pick is null.'),
});

const SYSTEM = `You choose the picture for one technique in a hobby lesson. You are shown numbered images found on Wikimedia Commons.

Pick the image that most clearly shows a beginner this technique: the position, movement, arrangement or diagram the technique is about.

Choose none (pick: null) when no image clearly shows it. An unrelated, decorative or misleading picture is worse than none: a guitar on a stand does not show sitting posture, and a photo of a chess set does not show a fork. Reject images that are mostly text, low quality, or show the skill done wrongly without saying so.

caption: one sentence of at most 20 words telling the learner what to notice in the picked image. Describe only what is visible in it. Empty when pick is null.

${dataRule(['technique'])}`;

/** Asks which of `count` images, sent after the prompt in order, shows the technique. */
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
