import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/atoms';
import { colors, radius, shadows } from '@/theme';

export type HobbyBadgeProps = {
  hobby: string;
  /** Known hobbies have one; a typed-in hobby falls back to its initial. */
  emoji?: string;
  size?: number;
};

/** The hobby's mark, carried from the end of onboarding onto the plan so the two read as one journey. */
export function HobbyBadge({ hobby, emoji, size = 72 }: HobbyBadgeProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.badge, { width: size, height: size }]}
    >
      {emoji ? (
        <Text style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>{emoji}</Text>
      ) : (
        <Text variant="title" color="primary">
          {hobby.trim().charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
});
