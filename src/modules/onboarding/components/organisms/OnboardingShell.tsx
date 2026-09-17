import { Feather } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ProgressBar, Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

import { ONBOARDING_STEPS } from '../../types';

export type OnboardingShellProps = {
  /** 1-based position in `ONBOARDING_STEPS`. */
  step: number;
  /** Feather glyph shown above the question — one per step, so the steps are distinct at a glance. */
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  /** Omit to hide the back control — the first step has nowhere to go. */
  onBack?: () => void;
  onNext: () => void;
  children: ReactNode;
};

const MAX_WIDTH = 520;

/**
 * The frame every question screen sits in: progress, back, heading, body, CTA.
 *
 * It takes `onBack` and `onNext` rather than reaching for the router, which is
 * what lets a screen be rendered and driven in a test without a navigator, and
 * keeps the rule that nothing below a route knows about navigation.
 */
export function OnboardingShell({
  step,
  icon,
  title,
  subtitle,
  ctaLabel = 'Continue',
  ctaDisabled = false,
  onBack,
  onNext,
  children,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();

  return (
    // `padding` on Android too: the app is edge-to-edge, which stops the
    // manifest's adjustResize from moving the CTA off the keyboard, so the
    // avoidance has to happen in JS on both platforms.
    <KeyboardAvoidingView behavior="padding" style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              disabled={!onBack}
              onPress={onBack}
              style={({ pressed }) => [styles.back, pressed ? styles.backPressed : null]}
            >
              {onBack ? <Feather aria-hidden name="chevron-left" size={28} color={colors.text.primary} /> : null}
            </Pressable>

            <ProgressBar
              total={ONBOARDING_STEPS.length}
              current={step}
              style={styles.progress}
            />
          </View>
        </View>
      </View>

      <ScrollView
        // A desktop browser's scrollbar takes width from the page and knocks
        // the centred layout off axis; every screen in the app hides it.
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.body}>
          <View style={styles.heading}>
            <View style={styles.iconTile}>
              <Feather aria-hidden name={icon} size={30} color={colors.text.primary} />
            </View>
            <Text variant="title" color="primary" align="center">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="body" color="secondary" align="center">
                {subtitle}
              </Text>
            ) : null}
          </View>

          {children}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.footerInner}>
          <Button block label={ctaLabel} disabled={ctaDisabled} onPress={onNext} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  headerInner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  // 44pt is the minimum comfortable touch target. Fixed, occupied or not, so the
  // bar sits in the same place on every step.
  back: {
    width: 44,
    height: 44,
    marginLeft: -spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  backPressed: { backgroundColor: colors.surface.pressed },
  progress: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  body: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    gap: spacing.xxl,
  },
  heading: { gap: spacing.sm, alignItems: 'center', paddingTop: spacing.lg },
  iconTile: {
    width: 64,
    height: 64,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.tint,
  },
  /** No divider: on paper a hairline above the CTA reads as a seam. */
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface.canvas,
  },
  footerInner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
});
