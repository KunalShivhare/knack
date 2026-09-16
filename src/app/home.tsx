import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HOBBY_SUGGESTIONS, LEVELS, TIME_BUDGETS, useOnboarding } from '@/modules/onboarding';
import { Button, LevelMeter, Text } from '@/shared/components/atoms';
import { colors, radius, shadows, spacing } from '@/theme';

const MAX_WIDTH = 520;
const BADGE = 104;

/**
 * Placeholder. Onboarding's job ends here; plan generation is not built yet, so
 * this screen exists to show that every answer survived the flow and a reload.
 * It is replaced wholesale by the plan screen — nothing else imports it.
 *
 * Set out as a starting line rather than a receipt of answers: where you are,
 * where you are headed, what it costs a week, and the plan as the next thing to
 * unlock. That is the extent of the game — progress made visible, nothing
 * awarded for its own sake.
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { answers, reset } = useOnboarding();

  const levelIndex = LEVELS.findIndex((option) => option.id === answers.level);
  const hours = TIME_BUDGETS.find((option) => option.id === answers.weeklyHours)?.label;
  const hobby = answers.hobby.trim();
  const emoji = HOBBY_SUGGESTIONS.find(
    (option) => option.label.toLowerCase() === hobby.toLowerCase(),
  )?.emoji;
  const motivation = answers.motivation.trim();

  // One spring as the screen lands: the beat where finishing onboarding pays off.
  const [pop] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
  }, [pop]);

  const startOver = () => {
    reset();
    router.replace('/onboarding');
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.hero}>
          <Animated.View style={[styles.badge, { transform: [{ scale: pop }] }]}>
            {/* A typed hobby has no emoji of its own, so it gets its initial. */}
            {emoji ? (
              <Text style={styles.badgeEmoji}>{emoji}</Text>
            ) : (
              <Text variant="title" color="primary">
                {hobby.charAt(0).toUpperCase()}
              </Text>
            )}
          </Animated.View>

          <View style={styles.pill}>
            <Text variant="label" color="inverse">
              Profile complete
            </Text>
          </View>

          <Text variant="title" color="primary" align="center">
            You’re all set, {answers.name.trim().split(' ')[0]}
          </Text>
          <Text variant="body" color="secondary" align="center">
            Here’s your starting line for {hobby.toLowerCase()}.
          </Text>
        </View>

        <View style={styles.card}>
          <Stop
            icon={<LevelMeter level={levelIndex + 1} total={LEVELS.length} />}
            label="Now"
            value={LEVELS[levelIndex]?.label}
          />
          <View style={styles.connector} />
          <Stop icon={<Text style={styles.icon}>🏁</Text>} label="Goal" value={answers.target} />
        </View>

        <View style={styles.card}>
          <Stop icon={<Text style={styles.icon}>⏱️</Text>} label="Each week" value={hours} />
          {motivation ? (
            <Stop icon={<Text style={styles.icon}>💬</Text>} label="Your why" value={motivation} />
          ) : null}
        </View>

        <View style={styles.locked}>
          <View style={styles.stopIcon}>
            <Text style={styles.icon}>🔒</Text>
          </View>
          <View style={styles.stopCopy}>
            <Text variant="subheadingStrong" color="primary">
              Your plan
            </Text>
            <Text variant="body" color="secondary">
              Unlocks next — built from everything above.
            </Text>
          </View>
        </View>

        <Button
          variant="ghost"
          size="md"
          label="Start over"
          style={styles.startOver}
          onPress={startOver}
        />
      </View>
    </ScrollView>
  );
}

function Stop({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <View style={styles.stop}>
      <View style={styles.stopIcon}>{icon}</View>
      <View style={styles.stopCopy}>
        <Text variant="body" color="secondary">
          {label}
        </Text>
        <Text variant="subheadingStrong" color="primary">
          {value?.trim() ? value : '—'}
        </Text>
      </View>
    </View>
  );
}

/** Wide enough for the level meter, so every stop's copy starts on one edge. */
const STOP_ICON = 40;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  badgeEmoji: { fontSize: 52, lineHeight: 62 },
  // The screen's one black element, so the 10% lands on the fact that matters.
  pill: {
    backgroundColor: colors.brand.default,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.surface.default,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  stop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stopIcon: { width: STOP_ICON, alignItems: 'center' },
  stopCopy: { flex: 1, gap: spacing.xxs },
  icon: { fontSize: 24, lineHeight: 30 },
  // Joins "now" to "goal" so the two read as one path, not two facts.
  connector: {
    width: 2,
    height: spacing.lg,
    marginVertical: -spacing.sm,
    marginLeft: STOP_ICON / 2 - 1,
    borderRadius: radius.pill,
    backgroundColor: colors.border.default,
  },
  // Dashed and tinted: present, but visibly not reached yet.
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.subtle,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border.strong,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  startOver: { alignSelf: 'center' },
});
