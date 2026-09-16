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
 * The picture for a technique, if it has one worth showing.
 *
 * Usually already found by the background lookup; if the lesson is opened first,
 * it is looked up here (sharing the request if one is already in flight). A found
 * picture, or a definite "none", is saved on the technique, so it is never looked
 * up twice. A failed lookup is not saved: it shows nothing now and tries again
 * the next time the technique is opened.
 */
export function useTechniqueImage(hobby: string, technique: JourneyTechnique): TechniqueImageState {
  const { setImage } = useJourney();
  const [failedId, setFailedId] = useState<string | null>(null);

  const { id, title, summary, imageQuery } = technique;
  // No phrase means no picture: the plan asks for one only where copying a
  // physical action needs it. Plans saved before pictures existed have none.
  const needed = typeof imageQuery === 'string' && technique.image === undefined && failedId !== id;

  useEffect(() => {
    if (!needed || typeof imageQuery !== 'string') return;

    let mounted = true;

    requestImage({ hobby, title, summary, query: imageQuery })
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
