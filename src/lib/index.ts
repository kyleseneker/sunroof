/**
 * Library exports
 */

export { supabase } from './supabase';
export { formatDate, formatDuration, getJourneyGradient, getTimeUntilUnlock, isJourneyUnlocked, getNotePrompts, truncate } from './utils';
export { hapticLight, hapticClick, hapticSuccess, hapticError } from './haptics';
export { getLocationContext } from './location';
export * from './weather';
export { searchLocationPhoto } from './unsplash';
export {
  initializeNotifications,
  scheduleJourneyUnlockNotification,
  areNotificationsEnabled,
  setNotificationsEnabled,
  scheduleDailyReminder,
  cancelDailyReminder,
} from './notifications';
export { getPreference, getPreferences, setPreference, convertTemperature, formatTemperature, type TemperatureUnit } from './preferences';
export {
  isBiometricsAvailable,
  getBiometricType,
  getBiometricName,
  authenticateWithBiometrics,
  type BiometricType,
} from './biometrics';
export { uploadQueue } from './uploadQueue';
export {
  getCachedActiveJourneys,
  getCachedPastJourneys,
  setCachedActiveJourneys,
  setCachedPastJourneys,
  invalidateJourneyCache,
  getLastFetchTime,
} from './journeyCache';
export { logger, createLogger, logGroup, logTime, logTimeEnd } from './logger';
export { validateEnv } from './env';

