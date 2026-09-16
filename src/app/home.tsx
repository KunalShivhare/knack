import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEVELS, TIME_BUDGETS, useOnboarding } from '@/modules/onboarding';
import { Button, Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

const MAX_WIDTH = 520;

/**
 * Placeholder. Onboarding's job ends here; plan generation is not built yet, so
 * this screen exists to show that every answer survived the flow and a reload.
 * It is replaced wholesale by the plan screen — nothing else imports it.
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { answers, reset } = useOnboarding();

  const level = LEVELS.find((option) => option.id === answers.level)?.label;
  const hours = TIME_BUDGETS.find((option) => option.id === answers.weeklyHours)?.label;

  const startOver = () => {
    reset();
    router.replace('/onboarding');
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxxl },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.heading}>
          <Text variant="label" color="tertiary">
            Ready
          </Text>
          <Text variant="title" color="primary">
            Thanks, {answers.name.trim().split(' ')[0]}.
          </Text>
          <Text variant="body" color="secondary">
            This is what your plan will be built from. Generating it comes next.
          </Text>
        </View>

        <View style={styles.card}>
          <Row label="Learning" value={answers.hobby} />
          <Row label="Right now" value={level} />
          <Row label="Aiming for" value={answers.target} />
          <Row label="Each week" value={hours} />
          <Row label="Because" value={answers.motivation} />
        </View>

        <Button block variant="secondary" label="Start over" onPress={startOver} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text variant="label" color="tertiary">
        {label}
      </Text>
      <Text variant="body" color="primary">
        {value?.trim() ? value : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: spacing.xxl },
  heading: { gap: spacing.sm },
  card: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  row: { gap: spacing.xxs },
});
