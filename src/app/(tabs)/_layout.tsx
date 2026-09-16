import { Redirect, Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { useJourney } from '@/modules/journey';
import { Text } from '@/shared/components/atoms';
import { colors, textVariants } from '@/theme';

/**
 * Two tabs, because there are two questions: what do I do next, and how am I
 * doing. Course content and practice tasks live inside each technique rather
 * than in tabs of their own — with five to eight techniques, separate tabs would
 * show the same list three ways.
 */
export default function TabsLayout() {
  const { hydrated, journey } = useJourney();

  // Reached without a plan (a stale link, or the plan was left): back to the gate.
  if (hydrated && !journey) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        sceneStyle: { backgroundColor: colors.surface.canvas },
      }}
    >
      <Tabs.Screen
        name="path"
        options={{ title: 'Path', tabBarIcon: ({ focused }) => <Icon glyph="🧭" focused={focused} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <Icon glyph="📈" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

/** Emoji can't take a tint, so the inactive tab is dimmed instead. */
function Icon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return <Text style={[styles.icon, focused ? null : styles.inactive]}>{glyph}</Text>;
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface.canvas,
    borderTopColor: colors.border.default,
    // The navigator boxes each icon in 28pt, and its default web bar is 49pt,
    // which leaves the label 10pt and cuts it in half. Native bars size
    // themselves around the safe-area inset, so only web gets a fixed height.
    ...Platform.select({ web: { height: 58 } }),
  },
  label: { ...textVariants.caption, lineHeight: 14, fontWeight: '600' },
  icon: { fontSize: 20, lineHeight: 22 },
  inactive: { opacity: 0.4 },
});
