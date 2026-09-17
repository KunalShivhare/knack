import { StyleSheet, View } from 'react-native';

import type { Visual } from '@/shared/contracts';
import { Text } from '@/shared/components/atoms';
import { colors, radius, shadows, spacing } from '@/theme';

/**
 * Draws a technique's infographic from the data the model wrote.
 *
 * Each kind has one fixed layout in the app's own type and colour, so a visual
 * written on the fly for any hobby still looks designed rather than generated.
 */
export function VisualBlock({ visual }: { visual: Visual }) {
  return (
    <View style={styles.card}>
      <Text variant="subheadingStrong" color="primary">
        {visual.title}
      </Text>
      {visual.kind === 'steps' ? <Steps steps={visual.steps} /> : null}
      {visual.kind === 'compare' ? <Compare left={visual.left} right={visual.right} /> : null}
      {visual.kind === 'numbers' ? <Numbers items={visual.items} /> : null}
    </View>
  );
}

type StepsVisual = Extract<Visual, { kind: 'steps' }>;

/** Numbered stops on a line — the same shape as the path, one level down. */
function Steps({ steps }: { steps: StepsVisual['steps'] }) {
  return (
    <View>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;

        return (
          <View key={index} style={styles.step}>
            <View style={styles.stepRail}>
              <View style={styles.stepNumber}>
                <Text variant="bodyStrong" color="inverse">
                  {index + 1}
                </Text>
              </View>
              {last ? null : <View style={styles.stepLine} />}
            </View>
            <View style={[styles.stepCopy, last ? null : styles.stepGap]}>
              <Text variant="bodyStrong" color="primary">
                {step.label}
              </Text>
              <Text variant="body" color="secondary">
                {step.detail}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

type CompareVisual = Extract<Visual, { kind: 'compare' }>;

/**
 * Two columns, told apart by ground: the left on the marigold tint, the right on
 * the panel. Not green against red — a compare is as often "this option versus
 * that one" as "do versus avoid", and colour-coding it as right and wrong would
 * mislabel half of them.
 */
function Compare({ left, right }: Pick<CompareVisual, 'left' | 'right'>) {
  return (
    <View style={styles.compare}>
      {[left, right].map((side, index) => (
        <View key={index} style={[styles.side, index === 0 ? styles.sideLeft : styles.sideRight]}>
          <Text variant="bodyStrong" color="primary">
            {side.heading}
          </Text>
          {side.points.map((point, pointIndex) => (
            <View key={pointIndex} style={styles.point}>
              <View style={styles.bullet} />
              <Text variant="body" color="secondary" style={styles.pointText}>
                {point}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

type NumbersVisual = Extract<Visual, { kind: 'numbers' }>;

function Numbers({ items }: { items: NumbersVisual['items'] }) {
  return (
    <View style={styles.numbers}>
      {items.map((item, index) => (
        <View key={index} style={styles.number}>
          <Text variant="stat" color="primary" style={styles.value}>
            {item.value}
          </Text>
          <Text variant="body" color="secondary">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const NUMBER = 26;

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.default,
    ...shadows.sm,
  },
  step: { flexDirection: 'row', gap: spacing.md },
  stepRail: { width: NUMBER, alignItems: 'center' },
  stepNumber: {
    width: NUMBER,
    height: NUMBER,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    width: 2,
    marginVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.border.default,
  },
  stepCopy: { flex: 1, gap: spacing.xxs, paddingTop: 2 },
  stepGap: { paddingBottom: spacing.lg },
  compare: { flexDirection: 'row', gap: spacing.sm },
  side: { flex: 1, gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg },
  sideLeft: { backgroundColor: colors.brand.tint },
  sideRight: { backgroundColor: colors.surface.panel },
  point: { flexDirection: 'row', gap: spacing.sm },
  bullet: {
    width: 5,
    height: 5,
    marginTop: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.text.secondary,
  },
  pointText: { flex: 1 },
  numbers: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  number: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.panel,
  },
  /** `stat` at a size that fits two tiles across a phone. */
  value: { fontSize: 28, lineHeight: 32 },
});
