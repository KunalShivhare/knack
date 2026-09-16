import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { JourneyProvider } from '@/modules/journey';
import { OnboardingProvider } from '@/modules/onboarding';
import { colors } from '@/theme';

/**
 * A technique opens as a sheet, not a pushed screen: it is looked at and put
 * down, with the path still behind it. expo-router renders this as a native
 * sheet on mobile, and on web as a bottom sheet at phone width and a centred
 * modal on a desktop (see EXPO_UNSTABLE_WEB_MODAL in package.json).
 *
 * A named object rather than inline: `webModalStyle` is part of expo-router's
 * web options but not of the native-stack type `options` is declared with.
 */
const TECHNIQUE_SHEET = {
  presentation: 'formSheet' as const,
  sheetAllowedDetents: [0.92],
  sheetGrabberVisible: true,
  sheetCornerRadius: 24,
  // Desktop only: the default modal runs the explainer past 120 characters a
  // line, well beyond a readable measure. Phones keep the full-width sheet.
  webModalStyle: { width: 640 },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* The browser tab's title, rendered into the server HTML and kept on the client. No-op on native. */}
      <Head>
        <title>Knack</title>
      </Head>
      <StatusBar style="dark" />
      <OnboardingProvider>
        <JourneyProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.surface.canvas },
            }}
          >
            <Stack.Screen name="technique/[id]" options={TECHNIQUE_SHEET} />
          </Stack>
        </JourneyProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
