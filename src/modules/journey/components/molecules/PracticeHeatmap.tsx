import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

import { heatLevel } from '../../state/selectors';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export type PracticeHeatmapProps = {
  /** Minutes per day: one row per week, oldest first; `null` for days still to come. */
  grid: (number | null)[][];
};

/**
 * Practice days as a grid, weeks left to right. Consistency is what builds a
 * skill, and a grid shows a gap in it at a glance where a total would hide it.
 */
export function PracticeHeatmap({ grid }: PracticeHeatmapProps) {
  const practised = grid.flat().filter((minutes) => (minutes ?? 0) > 0).length;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Practised on ${practised} of the last ${grid.length * 7} days`}
      style={styles.root}
    >
      {WEEKDAYS.map((weekday, day) => (
        <View key={day} style={styles.row}>
          <Text variant="caption" color="tertiary" style={styles.weekday}>
            {weekday}
          </Text>
          {grid.map((week, index) => {
            const minutes = week[day];
            return (
              <View
                key={index}
                style={[
                  styles.cell,
                  minutes === null
                    ? styles.future
                    : { backgroundColor: colors.progress.heatmap[heatLevel(minutes)] },
                ]}
              />
            );
          })}
        </View>
      ))}
      <View style={styles.legend}>
        <Text variant="caption" color="tertiary">
          Less
        </Text>
        {colors.progress.heatmap.map((shade) => (
          <View key={shade} style={[styles.legendCell, { backgroundColor: shade }]} />
        ))}
        <Text variant="caption" color="tertiary">
          More
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  weekday: { width: 16 },
  cell: { flex: 1, aspectRatio: 1, maxWidth: 36, borderRadius: radius.sm },
  future: { borderWidth: 1, borderColor: colors.border.subtle },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.xs },
  legendCell: { width: 12, height: 12, borderRadius: radius.sm },
});
