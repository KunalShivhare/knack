import { router } from 'expo-router';

import { OnboardingShell, stepIsComplete, useOnboarding } from '@/modules/onboarding';
import { Input } from '@/shared/components/atoms';

/** Step 1. One field, autofocused — the fastest possible first answer. */
export default function NameScreen() {
  const { answers, answer } = useOnboarding();

  const next = () => router.push('/onboarding/hobby');

  return (
    <OnboardingShell
      step={1}
      icon="👋"
      title="First — what should we call you?"
      subtitle="Your plan talks to you directly, so it helps to have a name."
      ctaDisabled={!stepIsComplete.name(answers)}
      onBack={() => router.back()}
      onNext={next}
    >
      <Input
        autoFocus
        value={answers.name}
        onChangeText={(name) => answer({ name })}
        placeholder="Your name"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => stepIsComplete.name(answers) && next()}
        accessibilityLabel="Your name"
      />
    </OnboardingShell>
  );
}
