import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BUDGET_MINUTES,
  PracticeHeatmap,
  formatMinutes,
  masteryOf,
  minutesSince,
  practiceGrid,
  startOfWeek,
  useJourney,
  weekBar,
  type WeekBar,
} from '@/modules/journey';
import { useOnboarding } from '@/modules/onboarding';
import { Button, ProgressBar, Text } from '@/shared/components/atoms';
import { colors, radius, shadows, spacing } from '@/theme';

const MAX_WIDTH = 520;

/**
 * How it is going, from things the learner actually did: techniques mastered,
 * practice logged against the weekly time they said they had, and which days
 * they showed up. No figure here is invented by the app.
 */
export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { journey, leave } = useJourney();
  const { reset } = useOnboarding();

  // Read once per visit. A screen left open past midnight shows yesterday's week,
  // which is a better trade than re-rendering on a timer.
  const [now] = useState(() => new Date());

  // Starting over deletes the plan and every session logged against it, so it
  // asks first — inline, like striking a technique, because React Native's
  // Alert does nothing on web.
  const [confirmingReset, setConfirmingReset] = useState(false);
  const scroll = useRef<ScrollView>(null);

  if (!journey) return null;

  const mastery = masteryOf(journey);
  const budget = BUDGET_MINUTES[journey.profile.weeklyHours];
  const thisWeek = minutesSince(journey.practice, startOfWeek(now));
  const bar = weekBar(thisWeek, budget);
  const mastered = journey.techniques.filter((technique) => technique.status === 'mastered');

  const startNewPlan = () => {
    leave();
    reset();
    router.replace('/onboarding');
  };

  return (
    <ScrollView
      ref={scroll}
      showsVerticalScrollIndicator={false}
      // A margin, not padding: the status bar is translucent, so content
      // scrolled into padding would run under the clock.
      style={[styles.root, { marginTop: insets.top }]}
      contentContainerStyle={styles.content}
      // The confirmation grows the page below the fold; bring it into view.
      onContentSizeChange={() => confirmingReset && scroll.current?.scrollToEnd()}
    >
      <View style={styles.inner}>
        <View style={styles.heading}>
          <Text variant="title" color="primary">
            Progress
          </Text>
          <Text variant="body" color="secondary">
            {journey.meta.hobby} · {journey.meta.goal}
          </Text>
        </View>

        <Card>
          <View style={styles.stats}>
            <Stat value={mastery.mastered} label="mastered" tone={colors.status.success} />
            <Stat value={mastery.toGo} label="to go" tone={colors.brand.strong} />
            <Stat value={mastery.struck} label="struck" tone={colors.status.struck} />
          </View>
          <ProgressBar total={mastery.mastered + mastery.toGo} current={mastery.mastered} />
          <Text variant="body" color="secondary">
            {mastery.percent}% of your plan mastered
          </Text>
        </Card>

        <Card title="This week">
          <View style={styles.week}>
            <Text variant="stat" color="primary">
              {formatMinutes(thisWeek)}
            </Text>
            <Text variant="body" color="secondary">
              of {budget.label} a week
            </Text>
          </View>
          <WeekTrack bar={bar} />
          <View style={styles.scale}>
            <Text variant="caption" color="tertiary">
              0
            </Text>
            {bar.marker !== null ? (
              <Text
                variant="caption"
                color="tertiary"
                align="center"
                style={[styles.target, { left: `${bar.marker * 100}%` }]}
              >
                {formatMinutes(budget.min)} target
              </Text>
            ) : null}
            <Text variant="caption" color="tertiary">
              {formatMinutes(bar.scale)}
            </Text>
          </View>
          {thisWeek === 0 ? (
            <Text variant="body" color="secondary">
              Log your first session — open a technique and tap 10, 20 or 30 min.
            </Text>
          ) : null}
        </Card>

        <Card title="Practice days">
          <PracticeHeatmap grid={practiceGrid(journey.practice, now)} />
        </Card>

        {mastered.length > 0 ? (
          <Card title="Mastered">
            {mastered.map((technique) => (
              <View key={technique.id} style={styles.row}>
                <Text variant="bodyStrong" color="primary" style={styles.rowTitle}>
                  {technique.title}
                </Text>
                {technique.statusChangedAt ? (
                  <Text variant="caption" color="secondary">
                    {new Date(technique.statusChangedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                ) : null}
              </View>
            ))}
          </Card>
        ) : null}

        {confirmingReset ? (
          <View style={styles.confirm}>
            <Text variant="body" color="secondary" align="center">
              This deletes your {journey.meta.hobby} plan and all the practice logged on it.
            </Text>
            <Button block label="Delete it and start over" onPress={startNewPlan} />
            <Button
              variant="ghost"
              size="md"
              label="Keep this plan"
              style={styles.centred}
              onPress={() => setConfirmingReset(false)}
            />
          </View>
        ) : (
          <Button
            variant="secondary"
            size="md"
            label="Start a new plan"
            style={styles.centred}
            onPress={() => setConfirmingReset(true)}
          />
        )}
      </View>
    </ScrollView>
  );
}

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      {title ? (
        <Text variant="subheadingStrong" color="primary">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** A count with a coloured key, so each figure matches its mark on the path. */
function Stat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="stat" color="primary">
        {value}
      </Text>
      <View style={styles.statLabel}>
        <View style={[styles.key, { backgroundColor: tone }]} />
        <Text variant="body" color="secondary">
          {label}
        </Text>
      </View>
    </View>
  );
}

/** This week's minutes against the budget, with the weekly floor marked when there is one. */
function WeekTrack({ bar }: { bar: WeekBar }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(bar.fill * 100) }}
      style={styles.track}
    >
      <View style={[styles.trackFill, { width: `${bar.fill * 100}%` }]} />
      {bar.marker !== null ? <View style={[styles.marker, { left: `${bar.marker * 100}%` }]} /> : null}
    </View>
  );
}

const TRACK = 10;
const TARGET_LABEL = 88;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: spacing.lg },
  heading: { gap: spacing.xxs, marginBottom: spacing.sm },
  // White on paper with a soft shadow: separated by fill, not by an outline.
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.default,
    ...shadows.sm,
  },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, gap: spacing.xxs },
  statLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  key: { width: 8, height: 8, borderRadius: radius.pill },
  week: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  track: { height: TRACK, borderRadius: radius.pill, backgroundColor: colors.progress.track },
  trackFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.progress.fill },
  // Overhangs the track so the floor reads as a line across it, not a notch.
  marker: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    width: 2,
    marginLeft: -1,
    borderRadius: radius.pill,
    backgroundColor: colors.text.primary,
  },
  scale: { flexDirection: 'row', justifyContent: 'space-between' },
  // Centred under the marker rather than between the ends, which only lines up
  // when the floor happens to sit halfway.
  target: { position: 'absolute', width: TARGET_LABEL, marginLeft: -TARGET_LABEL / 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowTitle: { flex: 1 },
  centred: { alignSelf: 'center' },
  confirm: { gap: spacing.md, marginTop: spacing.sm },
});
