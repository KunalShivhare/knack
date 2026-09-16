import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
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
} from '@/modules/journey';
import { useOnboarding } from '@/modules/onboarding';
import { Button, ProgressBar, Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

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

  if (!journey) return null;

  const mastery = masteryOf(journey);
  const budget = BUDGET_MINUTES[journey.profile.weeklyHours];
  const weekTarget = budget.max ?? budget.min;
  const thisWeek = minutesSince(journey.practice, startOfWeek(now));
  const mastered = journey.techniques.filter((technique) => technique.status === 'mastered');

  const startNewPlan = () => {
    leave();
    reset();
    router.replace('/onboarding');
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
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
            <Stat value={mastery.mastered} label="mastered" />
            <Stat value={mastery.toGo} label="to go" />
            <Stat value={mastery.struck} label="struck" />
          </View>
          <ProgressBar total={mastery.mastered + mastery.toGo} current={mastery.mastered} />
          <Text variant="body" color="secondary">
            {mastery.percent}% of your plan mastered
          </Text>
        </Card>

        <Card title="This week">
          <View style={styles.week}>
            <Text variant="title" color="primary">
              {formatMinutes(thisWeek)}
            </Text>
            <Text variant="body" color="secondary">
              of {budget.label} a week
            </Text>
          </View>
          <ProgressBar total={weekTarget} current={Math.min(thisWeek, weekTarget)} />
          {thisWeek === 0 ? (
            <Text variant="body" color="secondary">
              Log a session from any technique and it shows up here.
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

        <Button variant="ghost" size="md" label="Start a new plan" style={styles.newPlan} onPress={startNewPlan} />
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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="title" color="primary">
        {value}
      </Text>
      <Text variant="body" color="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: spacing.lg },
  heading: { gap: spacing.xxs, marginBottom: spacing.sm },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.default,
  },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, gap: spacing.xxs },
  week: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowTitle: { flex: 1 },
  newPlan: { alignSelf: 'center' },
});
