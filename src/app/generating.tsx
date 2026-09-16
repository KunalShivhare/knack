import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HobbyBadge,
  PathNode,
  useJourney,
  usePlanStream,
  useRevealCount,
  type PlanStream,
} from '@/modules/journey';
import { hobbyEmoji, toLearnerProfile, useOnboarding } from '@/modules/onboarding';
import { TECHNIQUE_COUNT, type LearnerProfile } from '@/shared/contracts';
import { Button, Reveal, Text } from '@/shared/components/atoms';
import { colors, spacing } from '@/theme';

const MAX_WIDTH = 520;
/**
 * The rows are left-aligned text on a rail, so at the hero's width they sit
 * visibly left of the centred title above them. A narrower centred column keeps
 * them under it; a phone is narrower than this anyway.
 */
const LIST_WIDTH = 360;

/**
 * The plan being written, technique by technique.
 *
 * Every slot the plan will fill is drawn from the start, so the learner sees
 * how big the plan is before it exists and watches it fill. The plan is saved
 * the moment it is complete; the button only moves on to it.
 */
export default function GeneratingScreen() {
  const { answers } = useOnboarding();
  const { create } = useJourney();

  // Nothing edits the answers on this screen, so this stays one object and
  // generation runs once.
  const profile = useMemo(() => toLearnerProfile(answers), [answers]);
  const { stream, attempt, retry } = usePlanStream(profile);

  const saved = useRef(false);
  useEffect(() => {
    if (stream.status !== 'done' || !profile || saved.current) return;

    saved.current = true;
    create({ profile, meta: stream.meta, techniques: stream.techniques });
  }, [stream, profile, create]);

  // Answers incomplete (storage cleared, say): there is nothing to generate from.
  if (!profile) return <Redirect href="/" />;

  // Keyed by attempt so a retry replays the reveal from nothing.
  return <Generation key={attempt} profile={profile} stream={stream} onRetry={retry} />;
}

type GenerationProps = {
  profile: LearnerProfile;
  stream: PlanStream;
  onRetry: () => void;
};

function Generation({ profile, stream, onRetry }: GenerationProps) {
  const insets = useSafeAreaInsets();
  const shown = useRevealCount(stream.techniques.length);

  const done = stream.status === 'done';
  const budgeted = TECHNIQUE_COUNT[profile.weeklyHours];
  // Once the plan is done its real length replaces the budgeted one.
  const slots = done ? shown : Math.max(budgeted, shown);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.hero}>
            <HobbyBadge hobby={profile.hobby} emoji={hobbyEmoji(profile.hobby)} />
            <Text variant="title" color="primary" align="center">
              {done ? `Your ${stream.meta.hobby} plan` : 'Building your plan'}
            </Text>
            <Text variant="body" color="secondary" align="center">
              {done ? stream.meta.goal : `${budgeted} techniques, picked for “${profile.target}”`}
            </Text>
          </View>

          <View style={styles.list}>
            {Array.from({ length: slots }, (_, index) => {
              const technique = index < shown ? stream.techniques[index] : null;
              const last = index === slots - 1;

              return technique ? (
                <Reveal key={technique.id}>
                  <PathNode
                    state="todo"
                    title={technique.title}
                    medium={technique.medium}
                    minutes={technique.drill.minutes}
                    last={last}
                  />
                </Reveal>
              ) : (
                <PathNode key={`slot-${index}`} state="pending" last={last} />
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.inner}>
          {stream.status === 'failed' ? (
            <View style={styles.failed}>
              <Text variant="body" color="secondary" align="center">
                {stream.message}
              </Text>
              <Button block label="Try again" onPress={onRetry} />
            </View>
          ) : done && shown === stream.techniques.length ? (
            <Button block label="Start learning" onPress={() => router.replace('/path')} />
          ) : (
            <View style={styles.working}>
              <ActivityIndicator color={colors.brand.default} />
              <Text variant="body" color="secondary">
                {shown === 0 ? 'Thinking about where you are…' : `Picked ${shown} so far…`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  hero: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxl },
  list: { width: '100%', maxWidth: LIST_WIDTH, alignSelf: 'center' },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  failed: { gap: spacing.md },
  // Same height as the button that replaces it, so the footer does not jump.
  working: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
