import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, textVariants } from '@/theme';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Knack</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.canvas,
    padding: spacing.xl,
  },
  title: {
    ...textVariants.display,
    color: colors.text.ink,
  },
});
