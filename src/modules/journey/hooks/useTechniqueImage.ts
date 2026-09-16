import { useEffect, useState } from 'react';

import type { TechniqueImage } from '@/shared/contracts';

import { requestImage } from '../api';
import { useJourney } from '../state';
import type { JourneyTechnique } from '../types';

export type TechniqueImageState =
  | { status: 'loading' }
  | { status: 'ready'; image: TechniqueImage }
  | { status: 'none' };

/**
 * The picture for a technique, looked up the first time it is needed.
 *
 * A found picture, or a definite "none", is saved on the technique, so it is
 * never looked up twice. A failed lookup is not saved: it shows nothing now and
 * tries again the next time the technique is opened.
 */
export function useTechniqueImage(hobby: string, technique: JourneyTechnique): TechniqueImageState {
  const { setImage } = useJourney();
  const [failedId, setFailedId] = useState<string | null>(null);

  // Techniques from plans made before pictures existed have no phrase at all
  // (undefined) and are looked up by title; `null` is the model saying no
  // picture could help.
  const skip = technique.imageQuery === null;
  const needed = !skip && technique.image === undefined && failedId !== technique.id;
  const { id, title, summary, imageQuery } = technique;

  useEffect(() => {
    if (!needed) return;

    let mounted = true;

    requestImage({ hobby, title, summary, query: imageQuery ?? undefined })
      // Saved even if the sheet has closed, so the wait is not wasted.
      .then((image) => setImage(id, image))
      .catch(() => {
        if (mounted) setFailedId(id);
      });

    return () => {
      mounted = false;
    };
  }, [needed, hobby, id, title, summary, imageQuery, setImage]);

  if (technique.image) return { status: 'ready', image: technique.image };
  if (needed) return { status: 'loading' };
  return { status: 'none' };
}
