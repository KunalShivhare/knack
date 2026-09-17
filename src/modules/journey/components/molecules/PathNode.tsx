import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Medium } from '@/shared/contracts';
import { Button, Text } from '@/shared/components/atoms';
import { colors, radius, shadows, spacing } from '@/theme';

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
  /** The current technique's call to action. Pressing it does what pressing the node does. */
  cta?: string;
  /** Drops the line to the next node. */
  last?: boolean;
  onPress?: () => void;
};

/**
 * One stop on the path: a marker on a continuous line, then the technique.
 * Each state has its own mark — a green tick behind, an ink ring with a marigold
 * centre for now, a hollow ring ahead — and the line turns green behind mastered
 * techniques, so how far along the learner is reads from the shape of the path
 * before any number does.
 */
export function PathNode({
  state,
  title,
  medium,
  minutes,
  summary,
  note,
  cta,
  last = false,
  onPress,
}: PathNodeProps) {
  const current = state === 'current';
  const struck = state === 'struck';
  const showCta = current && Boolean(cta) && Boolean(onPress);

  const content = (
    <>
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
              <Text variant="label" color="link">
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
            {showCta && cta ? <Button block size="md" label={cta} onPress={onPress} style={styles.cta} /> : null}
          </>
        )}
      </View>
    </>
  );

  // A card with its own button is not pressable itself: the button is the one
  // control, so only it gives press feedback, and web gets no <button> nested
  // in a <button>.
  if (showCta) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  );
}

function Marker({ state }: { state: PathNodeState }) {
  switch (state) {
    case 'mastered':
      return (
        <View style={[styles.marker, styles.markerDone]}>
          <Feather aria-hidden name="check" size={16} color={colors.common.white} />
        </View>
      );
    case 'current':
      return (
        <View style={styles.halo}>
          <View style={[styles.marker, styles.markerCurrent]}>
            <View style={styles.dot} />
          </View>
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
const HALO = 4;

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
  lineDone: { backgroundColor: colors.status.success },
  body: { flex: 1, gap: spacing.xs, paddingBottom: spacing.xl, minHeight: MARKER },
  lastBody: { paddingBottom: 0 },
  // The current technique is lifted into a card: it is the only one that needs action now.
  card: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.text.primary,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.default,
    ...shadows.sm,
  },
  cta: { marginTop: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxs },
  strike: { textDecorationLine: 'line-through' },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    backgroundColor: colors.surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: { backgroundColor: colors.status.success, borderColor: colors.status.success },
  markerCurrent: { borderWidth: 2.5, borderColor: colors.text.primary, backgroundColor: colors.surface.default },
  // A soft marigold ring around the current marker. The negative margin keeps it
  // out of the layout, so the rail's line still meets the marker itself.
  halo: { padding: HALO, margin: -HALO, borderRadius: radius.pill, backgroundColor: colors.brand.tint },
  markerFaint: { borderColor: colors.border.default },
  dot: { width: 12, height: 12, borderRadius: radius.pill, backgroundColor: colors.brand.default },
  dash: { width: 10, height: 2, borderRadius: radius.pill, backgroundColor: colors.border.strong },
  skeleton: { height: 12, borderRadius: radius.pill, backgroundColor: colors.surface.panel },
  skeletonTitle: { width: '70%', height: 16, marginTop: spacing.xs },
  skeletonMeta: { width: '40%' },
});
