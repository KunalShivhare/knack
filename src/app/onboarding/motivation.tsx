import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  OnboardingShell,
  TIME_BUDGETS,
  stepIsComplete,
  useOnboarding,
  type TimeBudgetId,
} from '@/modules/onboarding';
import { Text } from '@/shared/components/atoms';
import { ChipGroup, FormField } from '@/shared/components/molecules';
import { spacing } from '@/theme';

/**
 * Step 4. Motivation is the single biggest lift on plan quality, and the time
 * budget is the direct lever against overload — it caps how many techniques a
 * plan may hold. Motivation is optional; the budget is not.
 */
export default function MotivationScreen() {
  const { answers, answer, complete } = useOnboarding();

  const finish = () => {
    complete();
    router.replace('/home');
  };

  return (
    <OnboardingShell
      step={4}
      icon="⏳"
      title="Last one — why this, and how much time?"
      ctaLabel="Build my plan"
      ctaDisabled={!stepIsComplete.motivation(answers)}
      onBack={() => router.back()}
      onNext={finish}
    >
      <FormField
        multiline
        label="Why now?"
        hint="Optional, but it changes the plan more than anything else here."
        value={answers.motivation}
        onChangeText={(motivation) => answer({ motivation })}
        placeholder="I want to play at my sister's wedding in March."
        autoCapitalize="sentences"
      />

      <View style={styles.budget}>
        <Text variant="label" color="tertiary" align="center">
          Time a week
        </Text>
        <ChipGroup
          options={TIME_BUDGETS}
          value={answers.weeklyHours}
          onChange={(id) => answer({ weeklyHours: id as TimeBudgetId })}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  budget: { gap: spacing.sm },
});
