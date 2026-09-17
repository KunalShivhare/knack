import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HobbyBadge,
  PathNode,
  currentTechnique,
  masteryOf,
  useJourney,
  type JourneyTechnique,
  type PathNodeState,
} from '@/modules/journey';
import { hobbyEmoji } from '@/modules/onboarding';
import { ProgressBar, Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

const MAX_WIDTH = 520;

/**
 * Home. The plan as a path: where the learner is, what is behind them, what is
 * ahead. Everything that needs doing happens in a technique's sheet — this
 * screen only has to answer "what next", so it stays a single list.
 */
export default function PathScreen() {
  const insets = useSafeAreaInsets();
  const { journey } = useJourney();

  // The tabs layout redirects when there is no journey; this covers the frame before it does.
  if (!journey) return null;

  const mastery = masteryOf(journey);
  const current = currentTechnique(journey);
  const titles = new Map(journey.techniques.map((technique) => [technique.id, technique.title]));
  const inPlay = mastery.mastered + mastery.toGo;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      // A margin, not padding: the status bar is translucent, so content
      // scrolled into padding would run under the clock.
      style={[styles.root, { marginTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <HobbyBadge hobby={journey.meta.hobby} emoji={hobbyEmoji(journey.profile.hobby)} size={56} />
          <View style={styles.headerCopy}>
            <Text variant="title" color="primary">
              {journey.meta.hobby}
            </Text>
            <Text variant="body" color="secondary">
              {journey.meta.goal}
            </Text>
          </View>
        </View>

        <View style={styles.progress}>
          <View style={styles.progressRow}>
            <Text variant="bodyStrong" color="primary">
              {mastery.mastered} of {inPlay} mastered
            </Text>
            <Text variant="body" color="secondary">
              {mastery.percent}%
            </Text>
          </View>
          <ProgressBar total={inPlay} current={mastery.mastered} />
        </View>

        {current ? null : (
          <View style={styles.finished}>
            <Feather aria-hidden name="flag" size={24} color={colors.status.success} />
            <View style={styles.headerCopy}>
              <Text variant="subheadingStrong" color="primary">
                Path complete
              </Text>
              <Text variant="body" color="secondary">
                Every technique is mastered or struck. That is the goal reached.
              </Text>
            </View>
          </View>
        )}

        <View>
          {journey.techniques.map((technique, index) => (
            <PathNode
              key={technique.id}
              state={nodeState(technique, current)}
              title={technique.title}
              medium={technique.medium}
              minutes={technique.drill.minutes}
              summary={technique.summary}
              note={noteFor(technique, titles)}
              cta="Start lesson"
              last={index === journey.techniques.length - 1}
              onPress={() =>
                router.push({ pathname: '/technique/[id]', params: { id: technique.id } })
              }
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function nodeState(technique: JourneyTechnique, current: JourneyTechnique | null): PathNodeState {
  if (technique.status !== 'todo') return technique.status;
  return technique.id === current?.id ? 'current' : 'todo';
}

function noteFor(technique: JourneyTechnique, titles: Map<string, string>): string | undefined {
  if (technique.status !== 'struck') return undefined;

  const reason = technique.struckReason === 'too_hard' ? 'Too hard' : 'Not for me';
  const replacement = technique.replacedById ? titles.get(technique.replacedById) : undefined;

  return replacement ? `${reason} · swapped for ${replacement}` : reason;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  headerCopy: { flex: 1, gap: spacing.xxs },
  progress: { gap: spacing.sm },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  finished: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.status.successBg,
  },
});
