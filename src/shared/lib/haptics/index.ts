import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Browsers have no motor to drive, and expo-haptics does nothing useful there. */
const supported = Platform.OS !== 'web';

/** A device that refuses a haptic loses the buzz, never the tap. */
const ignore = () => undefined;

/**
 * The app's three kinds of touch feedback, named for what happened rather than
 * how strong it feels, so every screen means the same thing by the same buzz.
 */
export const haptics = {
  /** A choice among options changed. */
  select: () => {
    if (supported) Haptics.selectionAsync().catch(ignore);
  },
  /** Something small was recorded, such as logged practice minutes. */
  tap: () => {
    if (supported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore);
  },
  /** A technique mastered or a plan ready. Kept rare so it keeps meaning something. */
  success: () => {
    if (supported) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore);
  },
};
