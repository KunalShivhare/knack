import { TECHNIQUE_COUNT, type LearnerProfile } from '@/shared/contracts';
import { planSchema } from '@/shared/contracts/schemas';

import { toModelSchema, type JsonPrompt } from '../llm';
import { COACH_ROLE, MEDIUM_RULES, dataRule, learnerBlock, writingRules } from './coach';

const SELECTION_RULES = `Choosing techniques:
- Aim at the learner's target outcome, not at mastering the hobby. Leave out anything the target does not need, however standard it is.
- Skip what their current level means they already know.
- Order techniques so each one builds on those before it. Finishing the last one should get the learner to their target.
- If they gave a reason for learning, let it steer the selection. Someone playing guitar at a wedding needs one song played well more than a broad repertoire.`;

export function planPrompt(profile: LearnerProfile): JsonPrompt {
  const count = TECHNIQUE_COUNT[profile.weeklyHours];

  return {
    name: 'learning_plan',
    system: [
      COACH_ROLE,
      SELECTION_RULES,
      MEDIUM_RULES,
      writingRules(profile.weeklyHours),
      'Also return "hobby", the hobby as a short display name, "goal", the target restated as a short goal, and "emoji", one emoji that stands for the hobby itself.',
      dataRule(['learner']),
    ].join('\n\n'),
    user: `${learnerBlock(profile)}\n\nDesign the plan: exactly ${count} techniques, in the order they should be learned.`,
    schema: toModelSchema(planSchema(count)),
  };
}
