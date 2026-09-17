import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, shadows } from '@/theme';

export type DriftingHobby = {
  emoji: string;
  /** Position across one run of the field, as a fraction. */
  x: number;
  /** Position down the field, as a fraction. */
  y: number;
  size: number;
  opacity: number;
  rotate: number;
};

export type HobbyDriftProps = {
  hobbies: readonly DriftingHobby[];
  /** Screen width, which sets how far one loop travels. Layout itself is in percentages. */
  width: number;
  /** Points per second. Low numbers only — this is ambience, not motion design. */
  speed?: number;
};

/** How much wider one run is than the screen. */
const RUN_RATIO = 1.5;

/** A tile's side as a multiple of the glyph size: room around the emoji without crowding the field. */
const TILE = 1.15;

/**
 * A scattered field of hobby icons on paper tiles, drifting right to left, forever.
 *
 * Positions are authored rather than aligned: rows of evenly spaced glyphs read
 * as a grid, and a grid reads as a component. Scattering them at varied sizes
 * and angles is what makes it look like a drift of things rather than a list.
 *
 * Authored also means fixed — nothing is randomised at runtime. A field that
 * reshuffles on every launch feels unstable, and makes screenshot diffs
 * worthless.
 *
 * The field is laid out in percentages of the screen, not points. On web the
 * page is rendered on the server, where the window has no width, and the
 * browser keeps that markup's styles when it takes over; point positions
 * computed from a zero width left every tile stacked at the left edge. Only the
 * drift's distance needs the real width, and the animation runs in the browser.
 */
export function HobbyDrift({ hobbies, width, speed = 16 }: HobbyDriftProps) {
  const runWidth = width * RUN_RATIO;

  // Lazy state rather than a ref: the value is read during render to build the
  // transform below, which a ref is not allowed to be.
  const [offset] = useState(() => new Animated.Value(0));

  useEffect(() => {
    offset.setValue(0);

    const animation = Animated.loop(
      Animated.timing(offset, {
        toValue: 1,
        duration: (runWidth / speed) * 1000,
        easing: Easing.linear,
        // Web has no native animation module; asking for one there only logs a warning.
        useNativeDriver: Platform.OS !== 'web',
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [offset, runWidth, speed]);

  // The strip holds two identical runs. Travelling exactly one run's width to
  // the left slides the second copy into the place the first started from, so
  // the loop closes with no visible jump.
  const translateX = offset.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -runWidth],
  });

  return (
    <View style={styles.clip} pointerEvents="none">
      <Animated.View
        style={[
          styles.strip,
          { width: `${RUN_RATIO * 2 * 100}%`, transform: [{ translateX }] },
        ]}
      >
        {[0, 1].map((copy) =>
          hobbies.map((hobby) => (
            <View
              key={`${copy}-${hobby.emoji}`}
              style={[
                styles.tile,
                {
                  // One run is half the strip.
                  left: `${((copy + hobby.x) / 2) * 100}%`,
                  top: `${hobby.y * 100}%`,
                  width: hobby.size * TILE,
                  height: hobby.size * TILE,
                  borderRadius: hobby.size * 0.36,
                  opacity: hobby.opacity,
                  transform: [{ rotate: `${hobby.rotate}deg` }],
                },
              ]}
            >
              <Text style={{ fontSize: hobby.size * 0.62, lineHeight: hobby.size * 0.8 }}>{hobby.emoji}</Text>
            </View>
          )),
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { flex: 1, overflow: 'hidden' },
  strip: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  tile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.default,
    ...shadows.sm,
  },
});
