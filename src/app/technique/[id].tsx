import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MediumTag,
  PRACTICE_MINUTES,
  TechniquePicture,
  VisualBlock,
  currentTechnique,
  masteryOf,
  requestSwap,
  useJourney,
  useTechniqueImage,
  type Journey,
  type JourneyTechnique,
} from '@/modules/journey';
import type { StrikeReason } from '@/shared/contracts';
import { Button, Chip, Text } from '@/shared/components/atoms';
import { haptics } from '@/shared/lib/haptics';
import { isApiError } from '@/shared/lib/http';
import { colors, radius, spacing } from '@/theme';

/**
 * Explainers longer than this start folded to three lines.
 *
 * ponytail: a character count stands in for a measured line count, because
 * onTextLayout never fires on web. If text folds when it fits (or not when it
 * does not), measure lines on native and keep this threshold for web only.
 */
const FOLD_CHARS = 220;

/**
 * One technique: how to learn it, how to practise it, how to know it has landed,
 * and the three things the brief asks a learner to be able to do with it —
 * master it, strike it out, and (because the plan should adapt) swap it.
 *
 * Those actions sit in a bar pinned under the lesson rather than at the end of
 * it: the decision is the point of opening the sheet, and it should never be
 * three screens of reading away.
 */
export default function TechniqueSheet() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { journey, logPractice } = useJourney();

  const technique = journey?.techniques.find((item) => item.id === id) ?? null;
  // Tagged with the technique, because opening a replacement reuses this screen.
  const [logged, setLogged] = useState<{ techniqueId: string; minutes: number } | null>(null);
  // The technique mastered while this sheet was open. Only it celebrates;
  // reopening one mastered last week does not replay the moment.
  const [celebrating, setCelebrating] = useState<string | null>(null);

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
          style={({ pressed }) => [styles.close, pressed ? styles.closePressed : null]}
        >
          <Feather aria-hidden name="x" size={18} color={colors.text.primary} />
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
        contentContainerStyle={styles.content}
      >
        <View style={styles.heading}>
          <Text variant="heading" color="primary">
            {technique.title}
          </Text>
          <Text variant="subheading" color="secondary">
            {technique.summary}
          </Text>
        </View>

        {/* A visual technique leads with its infographic; for the others it
            follows the explanation it illustrates. */}
        {technique.medium === 'visual' && technique.visual ? <VisualBlock visual={technique.visual} /> : null}

        <Picture hobby={journey.meta.hobby} technique={technique} />

        <Section title="The idea">
          <Explainer text={technique.explainer} />
        </Section>

        {technique.medium !== 'visual' && technique.visual ? <VisualBlock visual={technique.visual} /> : null}

        <Section title="Why this way">
          <Text variant="body" color="secondary">
            {technique.mediumReason}
          </Text>
        </Section>

        <View style={[styles.card, styles.practice]}>
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
                      haptics.tap();
                      logPractice(technique.id, minutes);
                      setLogged({ techniqueId: technique.id, minutes });
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={[styles.card, styles.check]}>
          <Text variant="label" color="secondary">
            Mastery check
          </Text>
          <Text variant="subheading" color="primary">
            {technique.masteryCheck}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Keyed by status so a change of status resets whatever step of the flow was open. */}
        <Actions
          key={technique.status}
          journey={journey}
          technique={technique}
          celebrate={celebrating === technique.id}
          onMastered={() => setCelebrating(technique.id)}
        />
      </View>
    </View>
  );
}

/** Its own component so the lookup runs only once there is a technique to look up. */
function Picture({ hobby, technique }: { hobby: string; technique: JourneyTechnique }) {
  return <TechniquePicture state={useTechniqueImage(hobby, technique)} />;
}

/** The explainer, folded to three lines when long, so the practice card is in sight sooner. */
function Explainer({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const foldable = text.length > FOLD_CHARS;

  return (
    <View style={styles.explainer}>
      <Text variant="subheading" color="primary" numberOfLines={foldable && !open ? 3 : undefined}>
        {text}
      </Text>
      {foldable ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setOpen((value) => !value)}>
          <Text variant="bodyStrong" color="link">
            {open ? 'Show less' : 'Read more'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type SwapState = { status: 'idle' } | { status: 'loading' } | { status: 'failed'; message: string };

type ActionsProps = {
  journey: Journey;
  technique: JourneyTechnique;
  /** True only for the technique mastered while this sheet has been open. */
  celebrate: boolean;
  onMastered: () => void;
};

function Actions({ journey, technique, celebrate, onMastered }: ActionsProps) {
  const { setStatus, swap } = useJourney();
  const [choosingReason, setChoosingReason] = useState(false);
  const [swapState, setSwapState] = useState<SwapState>({ status: 'idle' });

  if (technique.status === 'mastered') {
    const mastery = masteryOf(journey);
    const next = currentTechnique(journey);

    return (
      <View style={styles.actions}>
        <View style={styles.mastered}>
          {/* Springs in only at the moment of mastering; reduce-motion skips the spring. */}
          <Animated.View entering={celebrate ? ZoomIn.springify() : undefined} style={styles.seal}>
            <Feather aria-hidden name="check" size={22} color={colors.common.white} />
          </Animated.View>
          <View style={styles.masteredCopy}>
            <Text variant="subheadingStrong" color="primary">
              {next ? 'Mastered' : 'Plan complete'}
            </Text>
            <Text variant="body" color="secondary">
              {mastery.mastered} of {mastery.mastered + mastery.toGo} mastered
            </Text>
          </View>
        </View>

        {next ? (
          <Button block label={`Next: ${next.title}`} onPress={() => router.setParams({ id: next.id })} />
        ) : (
          <Button block label="Back to your path" onPress={() => router.back()} />
        )}
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
            {swapState.status === 'failed' ? (
              <Text variant="body" color="secondary" align="center">
                {swapState.message}
              </Text>
            ) : null}
            <Button
              block
              label={technique.struckReason === 'too_hard' ? 'Swap in an easier step' : 'Swap in something different'}
              loading={swapState.status === 'loading'}
              onPress={replace}
            />
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
        <View style={styles.row}>
          <Button variant="secondary" size="md" label="Too hard" style={styles.grow} onPress={() => strike('too_hard')} />
          <Button variant="secondary" size="md" label="Not for me" style={styles.grow} onPress={() => strike('disliked')} />
        </View>
        <Button variant="ghost" size="md" label="Keep it" style={styles.quiet} onPress={() => setChoosingReason(false)} />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Button variant="ghost" size="md" label="Strike out" onPress={() => setChoosingReason(true)} />
      <Button
        label="I've got it"
        style={styles.grow}
        onPress={() => {
          haptics.success();
          onMastered();
          setStatus(technique.id, 'mastered');
        }}
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
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.panel,
  },
  closePressed: { backgroundColor: colors.surface.muted },
  scroll: { flex: 1 },
  // The pinned bar keeps the top padding, so the title starts where it did.
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface.canvas,
  },
  heading: { gap: spacing.sm },
  section: { gap: spacing.xs },
  explainer: { gap: spacing.xs, alignItems: 'flex-start' },
  card: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.xl },
  // Doing and checking look different, so the eye can find each without reading the label.
  practice: { backgroundColor: colors.surface.panel },
  check: { backgroundColor: colors.status.successBg },
  log: { gap: spacing.sm, marginTop: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm },
  bar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface.default,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actions: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
  mastered: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  seal: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.success,
  },
  masteredCopy: { flex: 1 },
  // Secondary actions sit centred under the primary one rather than hugging the left edge.
  quiet: { alignSelf: 'center' },
});
