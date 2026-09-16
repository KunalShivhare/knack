import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MediumTag,
  PRACTICE_MINUTES,
  TechniquePicture,
  VisualBlock,
  requestSwap,
  useJourney,
  useTechniqueImage,
  type Journey,
  type JourneyTechnique,
} from '@/modules/journey';
import type { StrikeReason } from '@/shared/contracts';
import { Button, Chip, Text } from '@/shared/components/atoms';
import { isApiError } from '@/shared/lib/http';
import { colors, radius, spacing } from '@/theme';

/**
 * One technique: how to learn it, how to practise it, how to know it has landed,
 * and the three things the brief asks a learner to be able to do with it —
 * master it, strike it out, and (because the plan should adapt) swap it.
 */
export default function TechniqueSheet() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { journey, logPractice } = useJourney();

  const technique = journey?.techniques.find((item) => item.id === id) ?? null;
  // Tagged with the technique, because opening a replacement reuses this screen.
  const [logged, setLogged] = useState<{ techniqueId: string; minutes: number } | null>(null);

  if (!journey || !technique) {
    return (
      <View style={styles.missing}>
        <Text variant="body" color="secondary" align="center">
          This technique is no longer in your plan.
        </Text>
        <Button variant="secondary" size="md" label="Close" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Outside the scroll view, so the way out stays in reach however far down the lesson is. */}
      <View style={styles.top}>
        <MediumTag medium={technique.medium} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.close}
        >
          <Text variant="heading" color="secondary">
            ×
          </Text>
        </Pressable>
      </View>

      <ScrollView
        // Remounted per technique, so opening a replacement starts at its top, not mid-page.
        key={technique.id}
        // Android's sheet only hands a downward drag to content that opts into
        // nested scrolling; without it, scrolling back up dismisses the sheet.
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >

        <View style={styles.heading}>
          <Text variant="title" color="primary">
            {technique.title}
          </Text>
          <Text variant="subheading" color="secondary">
            {technique.summary}
          </Text>
        </View>

        <Picture hobby={journey.meta.hobby} technique={technique} />

        {/* A visual technique leads with its infographic; for the others it
            follows the explanation it illustrates. */}
        {technique.medium === 'visual' && technique.visual ? <VisualBlock visual={technique.visual} /> : null}

        <Section title="The idea">
          <Text variant="subheading" color="primary">
            {technique.explainer}
          </Text>
        </Section>

        {technique.medium !== 'visual' && technique.visual ? <VisualBlock visual={technique.visual} /> : null}

        <Section title="Why this way">
          <Text variant="body" color="secondary">
            {technique.mediumReason}
          </Text>
        </Section>

        <View style={styles.card}>
          <Text variant="label" color="secondary">
            Practice · {technique.drill.minutes} min
          </Text>
          <Text variant="subheading" color="primary">
            {technique.drill.task}
          </Text>

          {technique.status === 'struck' ? null : (
            <View style={styles.log}>
              <Text variant="bodyStrong" color="primary">
                {logged?.techniqueId === technique.id
                  ? `Logged ${logged.minutes} min. It's on your Progress tab.`
                  : 'Did a session? Log it'}
              </Text>
              <View style={styles.chips}>
                {PRACTICE_MINUTES.map((minutes) => (
                  <Chip
                    key={minutes}
                    label={`${minutes} min`}
                    onPress={() => {
                      logPractice(technique.id, minutes);
                      setLogged({ techniqueId: technique.id, minutes });
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text variant="label" color="secondary">
            Mastery check
          </Text>
          <Text variant="subheading" color="primary">
            {technique.masteryCheck}
          </Text>
        </View>

        {/* Keyed by status so a change of status resets whatever step of the flow was open. */}
        <Actions key={technique.status} journey={journey} technique={technique} />
      </ScrollView>
    </View>
  );
}

/** Its own component so the lookup runs only once there is a technique to look up. */
function Picture({ hobby, technique }: { hobby: string; technique: JourneyTechnique }) {
  return <TechniquePicture state={useTechniqueImage(hobby, technique)} />;
}

type SwapState = { status: 'idle' } | { status: 'loading' } | { status: 'failed'; message: string };

function Actions({ journey, technique }: { journey: Journey; technique: JourneyTechnique }) {
  const { setStatus, swap } = useJourney();
  const [choosingReason, setChoosingReason] = useState(false);
  const [swapState, setSwapState] = useState<SwapState>({ status: 'idle' });

  if (technique.status === 'mastered') {
    return (
      <View style={styles.actions}>
        <Text variant="bodyStrong" color="primary" align="center">
          Mastered. Nice work.
        </Text>
        <Button
          variant="ghost"
          size="md"
          label="Not quite yet — undo"
          style={styles.quiet}
          onPress={() => setStatus(technique.id, 'todo')}
        />
      </View>
    );
  }

  if (technique.status === 'struck') {
    const replacement = journey.techniques.find((item) => item.id === technique.replacedById);

    const replace = async () => {
      setSwapState({ status: 'loading' });
      try {
        const next = await requestSwap({
          profile: journey.profile,
          planTitles: journey.techniques.map((item) => item.title),
          struck: { title: technique.title, summary: technique.summary },
          reason: technique.struckReason ?? 'disliked',
        });
        swap(technique.id, next);
        setSwapState({ status: 'idle' });
      } catch (error) {
        setSwapState({
          status: 'failed',
          message: isApiError(error) ? error.message : 'Something went wrong. Try again.',
        });
      }
    };

    return (
      <View style={styles.actions}>
        <Text variant="body" color="secondary" align="center">
          Struck out — {technique.struckReason === 'too_hard' ? 'too hard' : 'not for you'}.
        </Text>

        {replacement ? (
          <Button
            block
            variant="secondary"
            label={`Open ${replacement.title}`}
            onPress={() => router.setParams({ id: replacement.id })}
          />
        ) : (
          <>
            <Button
              block
              label={technique.struckReason === 'too_hard' ? 'Swap in an easier step' : 'Swap in something different'}
              loading={swapState.status === 'loading'}
              onPress={replace}
            />
            {swapState.status === 'failed' ? (
              <Text variant="body" color="secondary" align="center">
                {swapState.message}
              </Text>
            ) : null}
          </>
        )}

        <Button
          variant="ghost"
          size="md"
          label="Restore it"
          style={styles.quiet}
          onPress={() => setStatus(technique.id, 'todo')}
        />
      </View>
    );
  }

  if (choosingReason) {
    const strike = (reason: StrikeReason) => setStatus(technique.id, 'struck', reason);

    return (
      <View style={styles.actions}>
        <Text variant="bodyStrong" color="primary" align="center">
          What’s wrong with it?
        </Text>
        <View style={styles.reasons}>
          <Button variant="secondary" size="md" label="Too hard" style={styles.reason} onPress={() => strike('too_hard')} />
          <Button variant="secondary" size="md" label="Not for me" style={styles.reason} onPress={() => strike('disliked')} />
        </View>
        <Button
          variant="ghost"
          size="md"
          label="Keep it"
          style={styles.quiet}
          onPress={() => setChoosingReason(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.actions}>
      <Button block label="I've got it" onPress={() => setStatus(technique.id, 'mastered')} />
      <Button
        variant="ghost"
        size="md"
        label="Strike it out"
        style={styles.quiet}
        onPress={() => setChoosingReason(true)}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="subheadingStrong" color="primary">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  scroll: { flex: 1 },
  // The pinned bar keeps the top padding, so the title starts where it did.
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.xl },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface.canvas,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  heading: { gap: spacing.sm },
  section: { gap: spacing.xs },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
  },
  log: { gap: spacing.sm, marginTop: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  reasons: { flexDirection: 'row', gap: spacing.sm },
  reason: { flex: 1 },
  // Secondary actions sit centred under the primary one rather than hugging the left edge.
  quiet: { alignSelf: 'center' },
});
