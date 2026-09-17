import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, type ViewStyle } from 'react-native';

export type RevealProps = {
  children: ReactNode;
  style?: ViewStyle;
};

const DURATION_MS = 320;
const RISE = 12;

/**
 * Fades and lifts its content in once, on mount. For content that arrives while
 * the user watches — a technique landing in a streaming plan should look like it
 * arrived, not like the list re-rendered.
 */
export function Reveal({ children, style }: RevealProps) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
      // Web has no native animation module; asking for one there only logs a warning.
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [RISE, 0] });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
