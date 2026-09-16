import type { StrikeReason, SwapRequest } from '@/shared/contracts';
import { TechniqueSchema } from '@/shared/contracts/schemas';

import { toModelSchema, type JsonPrompt } from '../llm';
import { COACH_ROLE, MEDIUM_RULES, clean, dataRule, learnerBlock, writingRules } from './coach';

/**
 * The two reasons ask for different replacements. "Too hard" keeps the
 * destination and lowers the step; "not for me" keeps the destination and
 * changes the route. Rewording the struck technique satisfies neither.
 */
const REASON: Record<StrikeReason, string> = {
  too_hard: `The learner found it too hard. Replace it with an easier stepping stone that still moves them toward their target: break the skill into a smaller piece, or come at it from a simpler angle.`,
  disliked: `The learner did not enjoy it. Replace it with a different way to reach the same point on the path, through a different technique or a different medium, not a reworded version of the same thing.`,
};

export function swapPrompt(request: SwapRequest): JsonPrompt {
  const plan = request.planTitles.map((title, index) => `${index + 1}. ${clean(title)}`).join('\n');

  return {
    name: 'technique',
    system: [
      COACH_ROLE,
      'You are replacing one technique in a learner\'s existing plan. Return exactly one technique.',
      MEDIUM_RULES,
      writingRules(request.profile.weeklyHours),
      dataRule(['learner', 'plan', 'replacing']),
    ].join('\n\n'),
    user: `${learnerBlock(request.profile)}

Their current plan, in order:
<plan>
${plan}
</plan>

The technique being replaced:
<replacing>
${clean(request.struck.title)}: ${clean(request.struck.summary)}
</replacing>

${REASON[request.reason]}

The replacement must not repeat any technique already in the plan.`,
    schema: toModelSchema(TechniqueSchema),
  };
}
