/**
 * Notifications tests
 * 
 * Note: The notifications module uses dynamic require() for @notifee/react-native
 * which makes comprehensive mocking complex. These tests verify basic behavior
 * when notifee is available via the jest.setup.js mock.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Mock logger
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Import after mocks (notifee is mocked in jest.setup.js)
import {
  initializeNotifications,
  areNotificationsEnabled,
  cancelJourneyNotifications,
  cancelDailyReminder,
} from '@/lib/notifications';

describe('Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initializeNotifications', () => {
    it('runs without error on Android', async () => {
      (Platform as unknown as { OS: string }).OS = 'android';

      await expect(initializeNotifications()).resolves.not.toThrow();
    });

    it('runs without error on iOS', async () => {
      (Platform as unknown as { OS: string }).OS = 'ios';

      await expect(initializeNotifications()).resolves.not.toThrow();
    });
  });

  describe('areNotificationsEnabled', () => {
    it('returns boolean', async () => {
      const result = await areNotificationsEnabled();
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('cancelJourneyNotifications', () => {
    it('runs without error', async () => {
      await expect(cancelJourneyNotifications('j1')).resolves.not.toThrow();
    });
  });

  describe('cancelDailyReminder', () => {
    it('runs without error', async () => {
      await expect(cancelDailyReminder()).resolves.not.toThrow();
    });
  });
});
