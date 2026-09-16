import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Image, Text } from '@/shared/components/atoms';
import { apiUrl } from '@/shared/lib/http';
import { colors, radius, spacing } from '@/theme';

import type { TechniqueImageState } from '../../hooks/useTechniqueImage';

/** Tall photos would push the lesson off a phone screen, so past this height they scale down. */
const MAX_HEIGHT = 360;

/**
 * A real picture of the technique, with what to look at and who made it.
 *
 * While the lookup runs, a box the shape of a typical photo holds the place. If
 * nothing fits, the box goes and the lesson reads as it did before; the text
 * never waits on the picture.
 */
export function TechniquePicture({ state }: { state: TechniqueImageState }) {
  if (state.status === 'none') return null;

  if (state.status === 'loading') {
    return (
      <View style={styles.placeholder} accessibilityLabel="Finding a picture">
        <ActivityIndicator color={colors.text.tertiary} />
        <Text variant="caption" color="tertiary">
          Finding a picture…
        </Text>
      </View>
    );
  }

  const { image } = state;

  return (
    <View style={styles.figure}>
      <Image
        // Through the app's own route: Wikimedia refuses Android's image loader,
        // which ignores a custom user agent.
        source={{ uri: apiUrl(`/api/image-file?src=${encodeURIComponent(image.url)}`) }}
        aspectRatio={image.width / image.height}
        radius="xl"
        resizeMode="contain"
        accessibilityLabel={image.caption || 'Picture of the technique'}
        style={styles.picture}
      />
      {image.caption ? (
        <Text variant="body" color="secondary">
          {image.caption}
        </Text>
      ) : null}
      {/* The licences require the author, the licence and a link to the source. */}
      <Pressable accessibilityRole="link" hitSlop={8} onPress={() => Linking.openURL(image.sourceUrl)}>
        <Text variant="caption" color="tertiary">
          {image.credit} · {image.license} · Wikimedia Commons ↗
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { gap: spacing.sm },
  // A tall picture capped by the height narrows; centred, it does not look misplaced.
  picture: { maxHeight: MAX_HEIGHT, alignSelf: 'center' },
  placeholder: {
    aspectRatio: 4 / 3,
    maxHeight: MAX_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surface.muted,
  },
});
