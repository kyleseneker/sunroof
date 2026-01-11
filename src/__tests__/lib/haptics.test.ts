/**
 * Haptics tests
 */

import { Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { hapticLight, hapticClick, hapticSuccess, hapticError } from '@/lib/haptics';

describe('Haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to iOS for haptics testing
    (Platform as any).OS = 'ios';
  });

  describe('hapticLight', () => {
    it('triggers selection feedback', async () => {
      await hapticLight();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'selection',
        expect.objectContaining({ enableVibrateFallback: true })
      );
    });

    it('does nothing on web', async () => {
      (Platform as any).OS = 'web';

      await hapticLight();

      expect(ReactNativeHapticFeedback.trigger).not.toHaveBeenCalled();
    });
  });

  describe('hapticClick', () => {
    it('triggers impactMedium feedback', async () => {
      await hapticClick();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'impactMedium',
        expect.any(Object)
      );
    });
  });

  describe('hapticSuccess', () => {
    it('triggers notificationSuccess feedback', async () => {
      await hapticSuccess();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'notificationSuccess',
        expect.any(Object)
      );
    });
  });

  describe('hapticError', () => {
    it('triggers notificationError feedback', async () => {
      await hapticError();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'notificationError',
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('silently ignores errors', async () => {
      (ReactNativeHapticFeedback.trigger as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Haptic error');
      });

      // Should not throw
      await expect(hapticClick()).resolves.not.toThrow();
    });
  });
});
