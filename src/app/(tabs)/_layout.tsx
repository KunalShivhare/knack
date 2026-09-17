import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, View, type ColorValue } from 'react-native';

import { useImagePrefetch, useJourney } from '@/modules/journey';
import { colors, radius, textVariants } from '@/theme';

type IconName = ComponentProps<typeof Feather>['name'];

/**
 * Two tabs, because there are two questions: what do I do next, and how am I
 * doing. Course content and practice tasks live inside each technique rather
 * than in tabs of their own — with five to eight techniques, separate tabs would
 * show the same list three ways.
 */
export default function TabsLayout() {
  const { hydrated, journey } = useJourney();
  // Here, because the tabs are where a plan is being worked through.
  useImagePrefetch();

  // Reached without a plan (a stale link, or the plan was left): back to the gate.
  if (hydrated && !journey) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: styles.label,
        tabBarIconStyle: styles.iconBox,
        tabBarStyle: styles.bar,
        sceneStyle: { backgroundColor: colors.surface.canvas },
      }}
    >
      <Tabs.Screen
        name="path"
        options={{
          title: 'Path',
          tabBarIcon: ({ focused, color }) => <TabIcon name="map" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused, color }) => <TabIcon name="bar-chart-2" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

/** The active tab sits on a marigold-tint pill, so the choice shows in shape as well as ink. */
function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: ColorValue }) {
  return (
    <View style={[styles.pill, focused ? styles.pillOn : null]}>
      <Feather aria-hidden name={name} size={20} color={color} />
    </View>
  );
}

const PILL = { width: 52, height: 28 };

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface.default,
    borderTopColor: colors.border.default,
    // The navigator's default web bar is 49pt, which cuts the label under the
    // pill. Native bars size themselves around the safe-area inset, so only web
    // gets a fixed height.
    ...Platform.select({ web: { height: 64 } }),
  },
  label: { ...textVariants.caption, lineHeight: 14 },
  iconBox: PILL,
  pill: { ...PILL, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: colors.brand.tint },
});
