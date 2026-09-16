import { Pressable, StyleSheet, View } from 'react-native';

import type { Medium } from '@/shared/contracts';
import { Text } from '@/shared/components/atoms';
import { colors, radius, spacing } from '@/theme';

import { MediumTag } from './MediumTag';

/** `pending` is a slot for a technique that has not streamed in yet. */
export type PathNodeState = 'mastered' | 'current' | 'todo' | 'struck' | 'pending';

export type PathNodeProps = {
  state: PathNodeState;
  title?: string;
  medium?: Medium;
  minutes?: number;
  /** Shown only on the current technique, which is the one worth reading about. */
  summary?: string;
  /** A short status line, such as what a struck technique was swapped for. */
  note?: string;
  /** Drops the line to the next node. */
  last?: boolean;
  onPress?: () => void;
};

/**
 * One stop on the path: a marker on a continuous line, then the technique.
 * The line is dark behind mastered techniques, so how far along the learner is
 * reads from the shape of the path before any number does.
 */
export function PathNode({
  state,
  title,
  medium,
  minutes,
  summary,
  note,
  last = false,
  onPress,
}: PathNodeProps) {
  const current = state === 'current';
  const struck = state === 'struck';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <View style={styles.rail}>
        <Marker state={state} />
        {last ? null : <View style={[styles.line, state === 'mastered' ? styles.lineDone : null]} />}
      </View>

      <View style={[styles.body, current ? styles.card : null, last ? styles.lastBody : null]}>
        {state === 'pending' ? (
          <>
            <View style={[styles.skeleton, styles.skeletonTitle]} />
            <View style={[styles.skeleton, styles.skeletonMeta]} />
          </>
        ) : (
          <>
            {current ? (
              <Text variant="label" color="secondary">
                Up next
              </Text>
            ) : null}
            <Text
              variant="subheadingStrong"
              color={struck ? 'tertiary' : 'primary'}
              style={struck ? styles.strike : null}
            >
              {title}
            </Text>
            {current && summary ? (
              <Text variant="body" color="secondary">
                {summary}
              </Text>
            ) : null}
            {struck ? null : (
              <View style={styles.meta}>
                {medium ? <MediumTag medium={medium} /> : null}
                {minutes ? (
                  <Text variant="caption" color="secondary">
                    {minutes} min drill
                  </Text>
                ) : null}
              </View>
            )}
            {note ? (
              <Text variant="caption" color="secondary">
                {note}
              </Text>
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

function Marker({ state }: { state: PathNodeState }) {
  switch (state) {
    case 'mastered':
      return (
        <View style={[styles.marker, styles.markerDone]}>
          <Text variant="bodyStrong" color="inverse" style={styles.check}>
            ✓
          </Text>
        </View>
      );
    case 'current':
      return (
        <View style={[styles.marker, styles.markerCurrent]}>
          <View style={styles.dot} />
        </View>
      );
    case 'struck':
      return (
        <View style={[styles.marker, styles.markerFaint]}>
          <View style={styles.dash} />
        </View>
      );
    default:
      return <View style={[styles.marker, state === 'pending' ? styles.markerFaint : null]} />;
  }
}

const MARKER = 28;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  pressed: { opacity: 0.7 },
  rail: { width: MARKER, alignItems: 'center' },
  line: {
    flex: 1,
    width: 2,
    marginVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.border.default,
  },
  lineDone: { backgroundColor: colors.brand.default },
  body: { flex: 1, gap: spacing.xs, paddingBottom: spacing.xl, minHeight: MARKER },
  lastBody: { paddingBottom: 0 },
  // The current technique is lifted into a card: it is the only one that needs action now.
  card: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.brand.default,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.default,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxs },
  strike: { textDecorationLine: 'line-through' },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    backgroundColor: colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: { backgroundColor: colors.brand.default, borderColor: colors.brand.default },
  markerCurrent: { borderWidth: 2.5, borderColor: colors.brand.default },
  markerFaint: { borderColor: colors.border.default },
  check: { lineHeight: 18 },
  dot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.brand.default },
  dash: { width: 10, height: 2, borderRadius: radius.pill, backgroundColor: colors.border.strong },
  skeleton: { height: 12, borderRadius: radius.pill, backgroundColor: colors.surface.muted },
  skeletonTitle: { width: '70%', height: 16, marginTop: spacing.xs },
  skeletonMeta: { width: '40%' },
});
