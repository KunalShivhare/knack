import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** The question sequence. Sliding forward is what makes it read as a sequence. */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.surface.canvas },
      }}
    />
  );
}
