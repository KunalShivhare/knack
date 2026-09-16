import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  LEVELS,
  OnboardingShell,
  OptionTile,
  stepIsComplete,
  useOnboarding,
} from '@/modules/onboarding';
import { FormField } from '@/shared/components/molecules';
import { spacing } from '@/theme';

/**
 * Step 3. Both halves of the path on one screen, because a plan is the distance
 * between them and they are only meaningful read together.
 */
export default function GoalScreen() {
  const { answers, answer } = useOnboarding();

  const hobby = answers.hobby.trim().toLowerCase();

  return (
    <OnboardingShell
      step={3}
      icon="🧭"
      title="Where are you now, and where do you want to get?"
      ctaDisabled={!stepIsComplete.goal(answers)}
      onBack={() => router.back()}
      onNext={() => router.push('/onboarding/motivation')}
    >
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={`Your current level at ${hobby}`}
        style={styles.levels}
      >
        {LEVELS.map((level) => (
          <OptionTile
            key={level.id}
            label={level.label}
            description={level.description}
            selected={answers.level === level.id}
            onPress={() => answer({ level: level.id })}
          />
        ))}
      </View>

      <FormField
        label="What does good look like?"
        hint="Describe the thing you want to be able to do, not a level."
        value={answers.target}
        onChangeText={(target) => answer({ target })}
        placeholder="Play a full song start to finish"
        autoCapitalize="sentences"
        returnKeyType="done"
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  levels: { gap: spacing.sm },
});
