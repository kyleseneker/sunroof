/**
 * Journey Cache tests
 */

import {
  getCachedActiveJourneys,
  getCachedPastJourneys,
  setCachedActiveJourneys,
  setCachedPastJourneys,
  invalidateJourneyCache,
  getLastFetchTime,
} from '@/lib/journeyCache';
import type { Journey } from '@/types';

// Mock logger
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

const mockJourney: Journey = {
  id: 'journey-1',
  user_id: 'user-1',
  name: 'Test Journey',
  unlock_date: '2025-01-01T00:00:00Z',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
};

describe('Journey Cache', () => {
  beforeEach(() => {
    // Reset cache before each test
    invalidateJourneyCache('user-1');
    invalidateJourneyCache('user-2');
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCachedActiveJourneys', () => {
    it('returns null when cache is empty', () => {
      const result = getCachedActiveJourneys('user-1');

      expect(result.data).toBeNull();
      expect(result.isFresh).toBe(false);
      expect(result.isStale).toBe(false);
    });

    it('returns fresh data when recently cached', () => {
      setCachedActiveJourneys('user-1', [mockJourney]);

      const result = getCachedActiveJourneys('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.isFresh).toBe(true);
      expect(result.isStale).toBe(false);
    });

    it('returns stale data after STALE_TIME', () => {
      setCachedActiveJourneys('user-1', [mockJourney]);

      // Advance time past STALE_TIME (30 seconds)
      jest.advanceTimersByTime(31 * 1000);

      const result = getCachedActiveJourneys('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.isFresh).toBe(false);
      expect(result.isStale).toBe(true);
    });

    it('returns null after CACHE_TIME expires', () => {
      setCachedActiveJourneys('user-1', [mockJourney]);

      // Advance time past CACHE_TIME (5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000);

      const result = getCachedActiveJourneys('user-1');

      expect(result.data).toBeNull();
      expect(result.isFresh).toBe(false);
      expect(result.isStale).toBe(false);
    });
  });

  describe('getCachedPastJourneys', () => {
    it('returns null when cache is empty', () => {
      const result = getCachedPastJourneys('user-1');

      expect(result.data).toBeNull();
    });

    it('returns cached data', () => {
      setCachedPastJourneys('user-1', [mockJourney]);

      const result = getCachedPastJourneys('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.data![0].id).toBe('journey-1');
    });
  });

  describe('setCachedActiveJourneys', () => {
    it('stores journeys in cache', () => {
      setCachedActiveJourneys('user-1', [mockJourney]);

      const result = getCachedActiveJourneys('user-1');
      expect(result.data).toHaveLength(1);
    });

    it('stores for correct user', () => {
      setCachedActiveJourneys('user-1', [mockJourney]);
      setCachedActiveJourneys('user-2', []);

      expect(getCachedActiveJourneys('user-1').data).toHaveLength(1);
      expect(getCachedActiveJourneys('user-2').data).toHaveLength(0);
    });
  });

  describe('setCachedPastJourneys', () => {
    it('stores journeys in cache', () => {
      setCachedPastJourneys('user-1', [mockJourney]);

      const result = getCachedPastJourneys('user-1');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('invalidateJourneyCache', () => {
    it('clears all cache for a user', () => {
      setCachedActiveJourneys('user-1', [mockJourney]);
      setCachedPastJourneys('user-1', [mockJourney]);

      invalidateJourneyCache('user-1');

      expect(getCachedActiveJourneys('user-1').data).toBeNull();
      expect(getCachedPastJourneys('user-1').data).toBeNull();
    });

    it('does not affect other users', () => {
      setCachedActiveJourneys('user-1', [mockJourney]);
      setCachedActiveJourneys('user-2', [mockJourney]);

      invalidateJourneyCache('user-1');

      expect(getCachedActiveJourneys('user-1').data).toBeNull();
      expect(getCachedActiveJourneys('user-2').data).toHaveLength(1);
    });
  });

  describe('getLastFetchTime', () => {
    it('returns null when no cache exists', () => {
      expect(getLastFetchTime('user-1')).toBeNull();
    });

    it('returns latest fetch time', () => {
      const now = Date.now();
      setCachedActiveJourneys('user-1', [mockJourney]);

      const result = getLastFetchTime('user-1');

      expect(result).toBe(now);
    });

    it('returns most recent of active or past cache', () => {
      setCachedActiveJourneys('user-1', [mockJourney]);

      jest.advanceTimersByTime(1000);

      setCachedPastJourneys('user-1', [mockJourney]);

      const result = getLastFetchTime('user-1');
      const expectedTime = Date.now();

      expect(result).toBe(expectedTime);
    });
  });
});
