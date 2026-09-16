import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

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
  /** Screen width. One run is made wider than this so the field never runs out. */
  width: number;
  /** Points per second. Low numbers only — this is ambience, not motion design. */
  speed?: number;
};

/** How much wider one run is than the screen. */
const RUN_RATIO = 1.5;

/**
 * A scattered field of hobby icons drifting right to left, forever.
 *
 * Positions are authored rather than aligned: rows of evenly spaced glyphs read
 * as a grid, and a grid reads as a component. Scattering them at varied sizes
 * and angles is what makes it look like a drift of things rather than a list.
 *
 * Authored also means fixed — nothing is randomised at runtime. A field that
 * reshuffles on every launch feels unstable, and makes screenshot diffs
 * worthless.
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
        useNativeDriver: true,
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
          { width: runWidth * 2, transform: [{ translateX }] },
        ]}
      >
        {[0, 1].map((copy) =>
          hobbies.map((hobby) => (
            <Text
              key={`${copy}-${hobby.emoji}`}
              style={[
                styles.glyph,
                {
                  left: copy * runWidth + hobby.x * runWidth,
                  top: `${hobby.y * 100}%`,
                  fontSize: hobby.size,
                  lineHeight: hobby.size * 1.25,
                  opacity: hobby.opacity,
                  transform: [{ rotate: `${hobby.rotate}deg` }],
                },
              ]}
            >
              {hobby.emoji}
            </Text>
          )),
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { flex: 1, overflow: 'hidden' },
  strip: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  glyph: { position: 'absolute' },
});
