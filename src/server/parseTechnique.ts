import type { Technique } from '@/shared/contracts';
import { TechniqueSchema, VISUAL_MAX, VisualSchema } from '@/shared/contracts/schemas';

/**
 * Validates one technique from the model, first repairing the slips that say
 * nothing about its quality.
 *
 * Dropping a well-written technique because its id used an underscore, or its
 * drill ran to 75 minutes, costs the learner a whole step of their plan over a
 * formatting detail. Those are fixed here; anything that affects what the
 * learner reads — a missing explainer, a medium that is not one of the three —
 * still fails validation. Returns `null`, with the reason logged, when it does.
 */
export function parseTechnique(value: unknown): Technique | null {
  const parsed = TechniqueSchema.safeParse(repair(value));

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    console.warn(`Dropped a technique: ${issues.join('; ')}`);
    return null;
  }

  return parsed.data;
}

function repair(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;

  const technique = { ...(value as Record<string, unknown>) };

  // The id is ours to key on, not content: derive a clean slug from whatever came back.
  const source = typeof technique.id === 'string' && technique.id ? technique.id : technique.title;
  if (typeof source === 'string') technique.id = slug(source);

  const drill = technique.drill as Record<string, unknown> | undefined;
  if (drill && typeof drill.minutes === 'number') {
    technique.drill = { ...drill, minutes: Math.min(60, Math.max(5, Math.round(drill.minutes))) };
  }

  technique.visual = trimVisual(technique.visual);

  // An optional infographic that is malformed is left out. A visual technique
  // needs one, so for those the schema still rejects it.
  if (technique.medium !== 'visual' && !VisualSchema.nullable().safeParse(technique.visual).success) {
    console.warn('Dropped a malformed visual from a non-visual technique.');
    technique.visual = null;
  }

  return technique;
}

/** A visual with more entries than its layout holds keeps the first ones. */
function trimVisual(visual: unknown): unknown {
  if (visual === null || typeof visual !== 'object') return visual;

  const trimmed = { ...(visual as Record<string, unknown>) };
  const cap = (list: unknown, max: number) => (Array.isArray(list) ? list.slice(0, max) : list);

  trimmed.steps = cap(trimmed.steps, VISUAL_MAX.steps);
  trimmed.items = cap(trimmed.items, VISUAL_MAX.items);

  for (const side of ['left', 'right'] as const) {
    const column = trimmed[side] as Record<string, unknown> | undefined;
    if (column) trimmed[side] = { ...column, points: cap(column.points, VISUAL_MAX.points) };
  }

  // Keys set to `undefined` for kinds that lack them are stripped by the schema.
  return trimmed;
}

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/, '') || 'technique'
  );
}
