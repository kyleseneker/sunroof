/**
 * Haptic feedback utilities using react-native-haptic-feedback
 */

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Platform } from 'react-native';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Light haptic feedback (selection)
 */
export async function hapticLight(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    ReactNativeHapticFeedback.trigger('selection', options);
  } catch {
    // Ignore errors
  }
}

/**
 * Medium haptic feedback (click)
 */
export async function hapticClick(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    ReactNativeHapticFeedback.trigger('impactMedium', options);
  } catch {
    // Ignore errors
  }
}

/**
 * Success haptic feedback (notification)
 */
export async function hapticSuccess(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    ReactNativeHapticFeedback.trigger('notificationSuccess', options);
  } catch {
    // Ignore errors
  }
}

/**
 * Error haptic feedback
 */
export async function hapticError(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    ReactNativeHapticFeedback.trigger('notificationError', options);
  } catch {
    // Ignore errors
  }
}
