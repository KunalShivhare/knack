import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HOBBY_DRIFT, HobbyDrift } from '@/modules/onboarding';
import { Button, Text } from '@/shared/components/atoms';
import { colors, radius, shadows, spacing } from '@/theme';

const MAX_WIDTH = 520;

/**
 * Where the wash stops being white and starts becoming grey. Held white behind
 * the wordmark so the type stays crisp, then ramped so the lower half carries
 * real tone rather than a shade nobody can see.
 */
const WASH_STOPS = [0, 0.3, 1] as const;

/**
 * Welcome. Wordmark and promise pinned at the top, hobby icons drifting
 * sideways behind them, and the call to action floating free at the bottom.
 *
 * Nothing here is boxed. The field dissolves into the wash through a gradient
 * rather than stopping at the edge of a panel — a panel with a border draws a
 * line across the design and turns a splash into a form.
 *
 * The drift loops rather than paging: there is no sequence to get through and
 * nothing to swipe, so the only thing to do on this screen is start.
 */
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={colors.surface.wash}
        locations={WASH_STOPS}
        style={styles.wash}
      />

      <View style={[styles.stage, { paddingTop: insets.top + spacing.giant }]}>
        <View style={styles.header}>
          <Text variant="hero" color="primary" align="center">
            Knack
          </Text>
          <Text variant="subheading" color="secondary" align="center" style={styles.tagline}>
            Five techniques, not five hundred.{'\n'}Learn any hobby without the rabbit hole.
          </Text>
        </View>

        <HobbyDrift hobbies={HOBBY_DRIFT} width={width} />
      </View>

      {/* Dissolves the drift into the wash so the button has nothing behind it. */}
      <LinearGradient
        pointerEvents="none"
        colors={[colors.surface.washBottomClear, colors.surface.wash[2]]}
        locations={[0, 0.62]}
        style={styles.floor}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.footerInner}>
          <Button
            block
            label="Get started"
            style={styles.cta}
            onPress={() => router.push('/onboarding/name')}
          />

          <Text variant="caption" color="onWash" align="center">
            No account. Nothing to sign up for.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  stage: { flex: 1 },
  header: { paddingHorizontal: spacing.xl, gap: spacing.md, alignItems: 'center' },
  tagline: { maxWidth: 320 },
  floor: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '34%' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
  },
  footerInner: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  /** Lifted off the wash so it reads as floating rather than printed on it. */
  cta: { ...shadows.lg, borderRadius: radius.pill },
});
