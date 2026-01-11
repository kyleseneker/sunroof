/**
 * Weather utility tests
 */

import { getWeather } from '@/lib/weather';

// Mock logger
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

describe('Weather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWeather', () => {
    it('returns weather data for valid coordinates', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 72.5,
              relative_humidity_2m: 45,
              weather_code: 0,
            },
          }),
      });

      const result = await getWeather(40.7128, -74.006);

      expect(result).toEqual({
        temp: 73,
        condition: 'Clear',
        icon: '☀️',
        humidity: 45,
      });
    });

    it('rounds temperature to nearest integer', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 68.4,
              relative_humidity_2m: 50,
              weather_code: 0,
            },
          }),
      });

      const result = await getWeather(40.7128, -74.006);

      expect(result?.temp).toBe(68);
    });

    it('maps weather codes to conditions correctly', async () => {
      // Test partly cloudy
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 70,
              relative_humidity_2m: 60,
              weather_code: 2,
            },
          }),
      });

      const result = await getWeather(40.7128, -74.006);

      expect(result?.condition).toBe('Partly Cloudy');
      expect(result?.icon).toBe('⛅');
    });

    it('handles thunderstorm weather code', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 65,
              relative_humidity_2m: 80,
              weather_code: 95,
            },
          }),
      });

      const result = await getWeather(40.7128, -74.006);

      expect(result?.condition).toBe('Thunderstorm');
      expect(result?.icon).toBe('⛈️');
    });

    it('handles snow weather codes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 28,
              relative_humidity_2m: 70,
              weather_code: 73,
            },
          }),
      });

      const result = await getWeather(40.7128, -74.006);

      expect(result?.condition).toBe('Snow');
      expect(result?.icon).toBe('❄️');
    });

    it('handles unknown weather codes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 70,
              relative_humidity_2m: 50,
              weather_code: 999, // Unknown code
            },
          }),
      });

      const result = await getWeather(40.7128, -74.006);

      expect(result?.condition).toBe('Unknown');
      expect(result?.icon).toBe('🌡️');
    });

    it('returns null on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await getWeather(40.7128, -74.006);

      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getWeather(40.7128, -74.006);

      expect(result).toBeNull();
    });

    it('constructs correct API URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 70,
              relative_humidity_2m: 50,
              weather_code: 0,
            },
          }),
      });

      await getWeather(40.7128, -74.006);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('latitude=40.7128')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('longitude=-74.006')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('temperature_unit=fahrenheit')
      );
    });
  });
});
