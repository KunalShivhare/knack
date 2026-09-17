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
  const next = () => router.push('/onboarding/goal');

  return (
    <OnboardingShell
      step={2}
      icon="compass"
      title={`What do you want to get good at, ${firstName}?`}
      subtitle="Anything counts. One at a time, so it gets your full attention."
      ctaDisabled={!stepIsComplete.hobby(answers)}
      onBack={() => router.back()}
      onNext={next}
    >
      <HobbyPicker
        suggestions={HOBBY_SUGGESTIONS}
        value={answers.hobby}
        onChange={(hobby) => answer({ hobby })}
        onSubmitEditing={() => stepIsComplete.hobby(answers) && next()}
      />
    </OnboardingShell>
  );
}
