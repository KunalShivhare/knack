import { useEffect, useState } from 'react';

/**
 * Counts up to `target` one step at a time. When the fallback model returns a
 * whole plan at once, the techniques still land one after another rather than
 * as a block — the reveal is the moment the plan is felt, whichever model wrote
 * it. Remount (change the `key`) to start again from zero.
 */
export function useRevealCount(target: number, intervalMs = 380): number {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= target) return;

    const timer = setTimeout(() => setShown((count) => count + 1), shown === 0 ? 0 : intervalMs);
    return () => clearTimeout(timer);
  }, [shown, target, intervalMs]);

  return Math.min(shown, target);
}
