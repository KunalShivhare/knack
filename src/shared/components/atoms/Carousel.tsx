import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing } from '@/theme';

export type CarouselProps<T> = {
  data: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Snap width of one item, excluding `gap`. */
  itemWidth: number;
  gap?: number;
  /** Advance every N ms. Omit for a manual carousel. */
  autoPlayMs?: number;
  showDots?: boolean;
  contentInset?: number;
  onIndexChange?: (index: number) => void;
  style?: ViewStyle;
};

/**
 * Horizontal snapping rail. A plain ScrollView rather than a gesture library:
 * snapping, paging and momentum are already built in, and the list lengths here
 * are small enough that virtualisation would be premature.
 *
 * Autoplay stops for good the moment the user drags — once someone has taken
 * control, moving the rail under them is hostile.
 */
export function Carousel<T>({
  data,
  renderItem,
  itemWidth,
  gap = spacing.md,
  autoPlayMs,
  showDots = false,
  contentInset = 0,
  onIndexChange,
  style,
}: CarouselProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(Boolean(autoPlayMs));
  const stride = itemWidth + gap;

  useEffect(() => {
    if (!autoPlaying || !autoPlayMs || data.length < 2) return;

    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % data.length;
        scrollRef.current?.scrollTo({ x: next * stride, animated: true });
        onIndexChange?.(next);
        return next;
      });
    }, autoPlayMs);

    return () => clearInterval(timer);
  }, [autoPlaying, autoPlayMs, data.length, onIndexChange, stride]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / stride);
    if (next === index) return;
    setIndex(next);
    onIndexChange?.(next);
  };

  return (
    <View style={style}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={stride}
        snapToAlignment="start"
        disableIntervalMomentum
        onScrollBeginDrag={() => setAutoPlaying(false)}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ gap, paddingHorizontal: contentInset }}
      >
        {data.map((item, i) => (
          <View key={i} style={{ width: itemWidth }}>
            {renderItem(item, i)}
          </View>
        ))}
      </ScrollView>

      {showDots ? (
        <View style={styles.dots}>
          {data.map((_, i) => (
            <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.progress.track,
  },
  dotActive: { backgroundColor: colors.progress.fill, width: 18 },
});
