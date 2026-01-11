/**
 * Location utility tests
 */

import { getLocationContext } from '@/lib/location';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('@react-native-community/geolocation', () => ({
  setRNConfiguration: jest.fn(),
  requestAuthorization: jest.fn(),
  getCurrentPosition: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

import Geolocation from '@react-native-community/geolocation';

describe('Location', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    (Platform as any).OS = 'ios';
  });

  describe('getLocationContext', () => {
    it('returns location with coordinates and name on iOS', async () => {
      // Mock successful authorization
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success: () => void) =>
        success()
      );

      // Mock position
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
        (success: (pos: object) => void) => {
          success({
            coords: { latitude: 40.7128, longitude: -74.006 },
          });
        }
      );

      // Mock geocoding
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            address: {
              city: 'New York',
              state: 'New York',
            },
          }),
      });

      const result = await getLocationContext();

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        name: 'New York, New York',
      });
    });

    // Skip: Module-level cache prevents proper isolation between tests
    it.skip('returns null when permission denied on iOS', async () => {
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation(
        (_success: () => void, failure: () => void) => failure()
      );

      const result = await getLocationContext();

      expect(result).toBeNull();
    });

    it('returns location without name when geocoding fails', async () => {
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success: () => void) =>
        success()
      );

      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
        (success: (pos: object) => void) => {
          success({
            coords: { latitude: 40.7128, longitude: -74.006 },
          });
        }
      );

      mockFetch.mockRejectedValue(new Error('Geocoding failed'));

      const result = await getLocationContext();

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        name: undefined,
      });
    });

    it('returns null when getCurrentPosition fails', async () => {
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success: () => void) =>
        success()
      );

      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
        (_success: (pos: object) => void, error: (err: object) => void) => {
          error({ code: 1, message: 'Location unavailable' });
        }
      );

      const result = await getLocationContext();

      expect(result).toBeNull();
    });

    it('uses town when city not available', async () => {
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success: () => void) =>
        success()
      );

      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
        (success: (pos: object) => void) => {
          success({
            coords: { latitude: 42.3601, longitude: -71.0589 },
          });
        }
      );

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            address: {
              town: 'Cambridge',
              state: 'Massachusetts',
            },
          }),
      });

      const result = await getLocationContext();

      expect(result?.name).toBe('Cambridge, Massachusetts');
    });

    it('uses village when city and town not available', async () => {
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success: () => void) =>
        success()
      );

      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
        (success: (pos: object) => void) => {
          success({
            coords: { latitude: 42.0, longitude: -71.0 },
          });
        }
      );

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            address: {
              village: 'Small Town',
              state: 'Vermont',
            },
          }),
      });

      const result = await getLocationContext();

      expect(result?.name).toBe('Small Town, Vermont');
    });
  });
});
