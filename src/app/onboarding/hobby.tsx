import { router } from 'expo-router';

import {
  HOBBY_SUGGESTIONS,
  HobbyPicker,
  OnboardingShell,
  stepIsComplete,
  useOnboarding,
} from '@/modules/onboarding';

/** Step 2. Chips are shortcuts; the free-text field is the real answer. */
export default function HobbyScreen() {
  const { answers, answer } = useOnboarding();

  const firstName = answers.name.trim().split(' ')[0];

  return (
    <OnboardingShell
      step={2}
      icon="🎯"
      title={`What do you want to get good at, ${firstName}?`}
      subtitle="Anything counts. Pick one to start — you can add more later."
      ctaDisabled={!stepIsComplete.hobby(answers)}
      onBack={() => router.back()}
      onNext={() => router.push('/onboarding/goal')}
    >
      <HobbyPicker
        suggestions={HOBBY_SUGGESTIONS}
        value={answers.hobby}
        onChange={(hobby) => answer({ hobby })}
      />
    </OnboardingShell>
  );
}
