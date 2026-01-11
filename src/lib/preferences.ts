/**
 * User Preferences - Persistent settings storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from './logger';

const log = createLogger('Preferences');

const PREFERENCES_KEY = '@sunroof_preferences';

export type TemperatureUnit = 'fahrenheit' | 'celsius';

export interface UserPreferences {
  temperatureUnit: TemperatureUnit;
  captureLocation: boolean;
  captureWeather: boolean;
  biometricsEnabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  temperatureUnit: 'fahrenheit',
  captureLocation: true,
  captureWeather: true,
  biometricsEnabled: false,
};

let cachedPreferences: UserPreferences | null = null;

/**
 * Get all user preferences
 */
export async function getPreferences(): Promise<UserPreferences> {
  if (cachedPreferences) {
    return cachedPreferences;
  }

  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      const prefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      cachedPreferences = prefs;
      return prefs;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.warn(' Failed to load', { error: message });
  }

  cachedPreferences = DEFAULT_PREFERENCES;
  return DEFAULT_PREFERENCES;
}

/**
 * Update user preferences
 */
export async function setPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
  try {
    const current = await getPreferences();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    cachedPreferences = updated;
    log.debug(' Preferences saved', { keys: Object.keys(updates) });
    return updated;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(' Failed to save', { error: message });
    throw error;
  }
}

/**
 * Get a single preference value
 */
export async function getPreference<K extends keyof UserPreferences>(
  key: K
): Promise<UserPreferences[K]> {
  const prefs = await getPreferences();
  return prefs[key];
}

/**
 * Set a single preference value
 */
export async function setPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): Promise<void> {
  await setPreferences({ [key]: value });
}

/**
 * Convert temperature based on user preference
 */
export function convertTemperature(
  tempFahrenheit: number,
  unit: TemperatureUnit
): number {
  if (unit === 'celsius') {
    return Math.round((tempFahrenheit - 32) * (5 / 9));
  }
  return Math.round(tempFahrenheit);
}

/**
 * Format temperature with unit symbol
 */
export function formatTemperature(
  tempFahrenheit: number,
  unit: TemperatureUnit
): string {
  const converted = convertTemperature(tempFahrenheit, unit);
  return `${converted}°`;
}


