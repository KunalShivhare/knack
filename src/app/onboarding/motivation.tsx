import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  OnboardingShell,
  TIME_BUDGETS,
  hobbyExamples,
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
    router.replace('/generating');
  };

  return (
    <OnboardingShell
      step={4}
      icon="⏳"
      title="Last one — how much time, and why now?"
      ctaLabel="Build my plan"
      ctaDisabled={!stepIsComplete.motivation(answers)}
      onBack={() => router.back()}
      onNext={finish}
    >
      {/* Required before optional: the budget gates the CTA, so it goes where the
          eye lands first, and the free-text field sits nearest the keyboard. */}
      <View style={styles.budget}>
        <Text variant="subheadingStrong" color="primary" align="center">
          Time you can give each week
        </Text>
        <ChipGroup
          options={TIME_BUDGETS}
          value={answers.weeklyHours}
          onChange={(id) => answer({ weeklyHours: id as TimeBudgetId })}
        />
      </View>

      <FormField
        multiline
        label="Why now?"
        hint="Optional, but it changes the plan more than anything else here."
        value={answers.motivation}
        onChangeText={(motivation) => answer({ motivation })}
        placeholder={hobbyExamples(answers.hobby).why}
        autoCapitalize="sentences"
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  budget: { gap: spacing.md },
});
