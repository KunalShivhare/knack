import type { LearnerProfile, PlanMeta, StrikeReason, Technique } from '@/shared/contracts';

/** `struck` covers both brief cases — disliked and too hard — with the reason kept alongside. */
export type TechniqueStatus = 'todo' | 'mastered' | 'struck';

/** A technique as the learner has it: the plan's content plus what they have done with it. */
export type JourneyTechnique = Technique & {
  status: TechniqueStatus;
  /** ISO time of the last status change. Dates the mastered list. */
  statusChangedAt: string | null;
  struckReason: StrikeReason | null;
  /** Set when this technique was swapped out; the replacement sits right after it. */
  replacedById: string | null;
};

export type PracticeEntry = {
  techniqueId: string;
  minutes: number;
  loggedAt: string;
};

/**
 * One hobby's plan and everything done against it. Stored as an array although
 * the app shows one at a time: a second hobby later is then a feature, not a
 * migration.
 */
export type Journey = {
  id: string;
  createdAt: string;
  /** The answers the plan was built from — swaps need them, and onboarding can be reset. */
  profile: LearnerProfile;
  meta: PlanMeta;
  techniques: JourneyTechnique[];
  practice: PracticeEntry[];
};
