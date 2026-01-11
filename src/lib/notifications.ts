/**
 * Notifications Service using @notifee/react-native
 * Handles local push notifications for journey reminders
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from './logger';

const log = createLogger('Notifications');

// Import notifee with fallback - types are any because module is optional
/* eslint-disable @typescript-eslint/no-explicit-any */
let notifee: any = null;
let AuthorizationStatus: any = {};
let AndroidImportance: any = {};
let TriggerType: any = {};
let RepeatFrequency: any = {};
/* eslint-enable @typescript-eslint/no-explicit-any */

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default;
  AuthorizationStatus = notifeeModule.AuthorizationStatus || {};
  AndroidImportance = notifeeModule.AndroidImportance || {};
  TriggerType = notifeeModule.TriggerType || {};
  RepeatFrequency = notifeeModule.RepeatFrequency || {};
} catch (e) {
  log.warn('Notifee not available', { error: e });
}

const NOTIFICATIONS_ENABLED_KEY = '@sunroof/notifications_enabled';
const CHANNEL_ID = 'sunroof-journeys';

/**
 * Initialize notification channels (required for Android)
 */
export async function initializeNotifications(): Promise<void> {
  if (!notifee) {
    log.warn('Notifee not available');
    return;
  }
  
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Journey Notifications',
      description: 'Notifications for journey unlocks and reminders',
      importance: AndroidImportance.HIGH,
    });
  }
}

/**
 * Request notification permissions
 */
async function requestNotificationPermission(): Promise<boolean> {
  if (!notifee) return false;
  
  try {
    const settings = await notifee.requestPermission();
    const granted =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

    if (granted) {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      await initializeNotifications();
    }

    log.debug('Permission result', { granted });
    return granted;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Permission request error', { error: message });
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  if (!notifee) return false;
  
  try {
    const settings = await notifee.getNotificationSettings();
    const systemEnabled =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

    const userEnabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return systemEnabled && userEnabled === 'true';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Check enabled error', { error: message });
    return false;
  }
}

/**
 * Enable or disable notifications
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<boolean> {
  if (!notifee) return false;
  
  try {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return false;
      }
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
    } else {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      await notifee.cancelAllNotifications();
    }
    log.info('Notifications toggled', { enabled });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Set enabled error', { error: message });
    return false;
  }
}

/**
 * Schedule a notification for when a journey unlocks
 */
export async function scheduleJourneyUnlockNotification(
  journeyId: string,
  journeyName: string,
  unlockDate: Date
): Promise<void> {
  if (!notifee) return;
  
  try {
    const enabled = await areNotificationsEnabled();
    if (!enabled) return;

    const now = new Date();
    if (unlockDate <= now) return;

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: unlockDate.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id: `journey-unlock-${journeyId}`,
        title: '🎉 Journey Unlocked!',
        body: `Your journey "${journeyName}" is now ready to view!`,
        android: {
          channelId: CHANNEL_ID,
          pressAction: { id: 'default' },
        },
        data: { type: 'journey_unlock', journeyId },
      },
      trigger
    );

    const oneDayBefore = new Date(unlockDate.getTime() - 24 * 60 * 60 * 1000);
    if (oneDayBefore > now) {
      await notifee.createTriggerNotification(
        {
          id: `journey-reminder-${journeyId}`,
          title: '⏰ Journey Unlocks Tomorrow!',
          body: `"${journeyName}" will be ready to view tomorrow!`,
          android: {
            channelId: CHANNEL_ID,
            pressAction: { id: 'default' },
          },
          data: { type: 'journey_reminder', journeyId },
        },
        { type: TriggerType.TIMESTAMP, timestamp: oneDayBefore.getTime() }
      );
    }

    log.info('Scheduled unlock notification', { journeyId, journeyName });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Schedule unlock error', { error: message, journeyId });
  }
}

/**
 * Cancel notifications for a specific journey
 */
export async function cancelJourneyNotifications(journeyId: string): Promise<void> {
  if (!notifee) return;
  
  try {
    await notifee.cancelNotification(`journey-unlock-${journeyId}`);
    await notifee.cancelNotification(`journey-reminder-${journeyId}`);
    log.debug('Journey notifications cancelled', { journeyId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Cancel error', { error: message, journeyId });
  }
}

/**
 * Schedule daily reminder to add memories
 */
export async function scheduleDailyReminder(hour: number = 19): Promise<void> {
  if (!notifee) return;
  
  try {
    const enabled = await areNotificationsEnabled();
    if (!enabled) return;

    await notifee.cancelNotification('daily-reminder');

    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hour, 0, 0, 0);
    if (trigger <= now) trigger.setDate(trigger.getDate() + 1);

    await notifee.createTriggerNotification(
      {
        id: 'daily-reminder',
        title: '📸 Capture a Memory',
        body: 'Take a moment to add a photo or note to your journey!',
        android: {
          channelId: CHANNEL_ID,
          pressAction: { id: 'default' },
        },
        data: { type: 'daily_reminder' },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: trigger.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      }
    );
    log.info('Daily reminder scheduled', { hour });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Schedule daily reminder error', { error: message });
  }
}

/**
 * Cancel daily reminder
 */
export async function cancelDailyReminder(): Promise<void> {
  if (!notifee) return;
  
  try {
    await notifee.cancelNotification('daily-reminder');
    log.debug('Daily reminder cancelled');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Cancel daily reminder error', { error: message });
  }
}
