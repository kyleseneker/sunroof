/**
 * Preferences tests
 */

import { convertTemperature, formatTemperature } from '@/lib/preferences';

// Mock logger
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('Preferences', () => {
  describe('convertTemperature', () => {
    it('returns rounded fahrenheit when unit is fahrenheit', () => {
      expect(convertTemperature(72.5, 'fahrenheit')).toBe(73);
      expect(convertTemperature(32, 'fahrenheit')).toBe(32);
      expect(convertTemperature(98.6, 'fahrenheit')).toBe(99);
    });

    it('converts to celsius when unit is celsius', () => {
      expect(convertTemperature(32, 'celsius')).toBe(0);
      expect(convertTemperature(212, 'celsius')).toBe(100);
      expect(convertTemperature(68, 'celsius')).toBe(20);
      expect(convertTemperature(50, 'celsius')).toBe(10);
    });

    it('handles negative temperatures', () => {
      expect(convertTemperature(0, 'celsius')).toBe(-18);
      expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
      expect(convertTemperature(-40, 'celsius')).toBe(-40);
    });
  });

  describe('formatTemperature', () => {
    it('formats fahrenheit with degree symbol', () => {
      expect(formatTemperature(72, 'fahrenheit')).toBe('72°');
      expect(formatTemperature(100, 'fahrenheit')).toBe('100°');
    });

    it('formats celsius with degree symbol', () => {
      expect(formatTemperature(68, 'celsius')).toBe('20°');
      expect(formatTemperature(32, 'celsius')).toBe('0°');
    });

    it('handles edge cases', () => {
      expect(formatTemperature(0, 'fahrenheit')).toBe('0°');
      expect(formatTemperature(-40, 'fahrenheit')).toBe('-40°');
    });
  });
});
