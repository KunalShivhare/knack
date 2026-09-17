import { useEffect, useState } from 'react';
import { Image } from 'react-native';

import { pictureUrl, requestImage } from '../api';
import { needsPictureLookup, useJourney } from '../state';

/**
 * Finds the plan's pictures in the background, so a lesson usually opens with
 * its picture ready instead of a placeholder, and downloads each one found.
 *
 * One lookup at a time, in path order: each costs a model call from a small
 * daily free quota, and the learner reads the first lessons first. Struck
 * techniques are skipped. A lookup that fails is not retried here; the lesson
 * retries it when opened.
 */
export function useImagePrefetch(): void {
  const { journey, setImage } = useJourney();
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());

  const next = journey?.techniques.find(
    (technique) =>
      technique.status !== 'struck' &&
      needsPictureLookup(technique) &&
      !failed.has(`${journey.id}:${technique.id}`),
  );

  const journeyId = journey?.id;
  const hobby = journey?.meta.hobby;
  const { id, title, summary, imageQuery } = next ?? {};

  useEffect(() => {
    if (!journeyId || !hobby || !id || !title || !summary || typeof imageQuery !== 'string') return;

    requestImage({ hobby, title, summary, query: imageQuery })
      .then((image) => {
        // Saving moves this hook on to the next technique.
        setImage(id, image);
        if (image) void Image.prefetch(pictureUrl(image)).catch(() => {});
      })
      .catch(() => setFailed((current) => new Set(current).add(`${journeyId}:${id}`)));
  }, [journeyId, hobby, id, title, summary, imageQuery, setImage]);
}
