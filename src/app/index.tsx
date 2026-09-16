import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  firstIncompleteStep,
  useOnboarding,
  type OnboardingStep,
} from '@/modules/onboarding';
import { colors } from '@/theme';

/**
 * Written out rather than built from a template string so typed routes can check
 * every destination. It is also the only place in the app that maps a step to a
 * path — screens navigate to literals.
 */
const STEP_ROUTES: Record<OnboardingStep, Href> = {
  name: '/onboarding/name',
  hobby: '/onboarding/hobby',
  goal: '/onboarding/goal',
  motivation: '/onboarding/motivation',
};

/**
 * The launch gate. Reads the saved run and sends the user to the furthest step
 * they had not finished, so closing the app mid-onboarding costs them nothing.
 */
export default function IndexScreen() {
  const { hydrated, completed, answers } = useOnboarding();

  // Redirecting before storage is read would flash the wrong screen.
  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  if (completed) return <Redirect href="/home" />;

  const step = firstIncompleteStep(answers);

  // Nothing answered yet: this is a first run, so start at the welcome screen.
  if (step === 'name' && answers.name.length === 0) {
    return <Redirect href="/onboarding" />;
  }

  // Every step answered but never confirmed — resume on the last one.
  return <Redirect href={STEP_ROUTES[step ?? 'motivation']} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.canvas,
  },
});
