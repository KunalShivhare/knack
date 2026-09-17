import { Feather } from '@expo/vector-icons';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { JourneyProvider } from '@/modules/journey';
import { OnboardingProvider } from '@/modules/onboarding';
import { colors } from '@/theme';

/**
 * Every face `textVariants` names, plus the icon font so tab and lesson icons do
 * not pop in a frame after the text.
 */
const FONT_FACES = {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  ...Feather.font,
};

// Held until the faces are ready, so the first frame is not set in the system font.
void SplashScreen.preventAutoHideAsync();

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
  // A little of the path stays visible above the sheet on native. On web the
  // sheet library draws a fractional detent by sliding a full-height sheet down,
  // which pushes the lesson's pinned action bar off the bottom of the screen, so
  // the web sheet opens at full height instead.
  sheetAllowedDetents: Platform.OS === 'web' ? [1] : [0.92],
  sheetGrabberVisible: true,
  sheetCornerRadius: 24,
  // Desktop only: the default modal runs the explainer past 120 characters a
  // line, well beyond a readable measure. Phones keep the full-width sheet.
  // The height gives the lesson room above its pinned action bar; the default
  // clamp left three lines of lesson visible on a laptop screen.
  webModalStyle: { width: 640, height: '85%' },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_FACES);
  // A failed download must not trap the learner on the splash: carry on in the system face.
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

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
