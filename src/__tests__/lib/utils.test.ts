/**
 * Utility function tests
 */

import {
  formatDate,
  getTimeUntilUnlock,
  isJourneyUnlocked,
  formatDuration,
  truncate,
} from '@/lib/utils';

describe('formatDate', () => {
  it('formats a date string with default options', () => {
    const result = formatDate('2024-06-15T12:00:00Z');
    expect(result).toMatch(/Jun 15, 2024/);
  });

  it('formats a date with custom options', () => {
    const result = formatDate('2024-06-15T12:00:00Z', { weekday: 'long' });
    expect(result).toMatch(/Saturday/);
  });
});

describe('getTimeUntilUnlock', () => {
  it('returns "Now" for past dates', () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    expect(getTimeUntilUnlock(pastDate)).toBe('Now');
  });

  it('returns days and hours for future dates', () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString();
    expect(getTimeUntilUnlock(futureDate)).toMatch(/2d 3h/);
  });

  it('returns hours and minutes when less than a day', () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString();
    expect(getTimeUntilUnlock(futureDate)).toMatch(/5h 30m/);
  });

  it('returns only minutes when less than an hour', () => {
    const futureDate = new Date(Date.now() + 45 * 60 * 1000).toISOString();
    expect(getTimeUntilUnlock(futureDate)).toMatch(/45m/);
  });
});

describe('isJourneyUnlocked', () => {
  it('returns true for completed journeys', () => {
    const journey = {
      unlock_date: new Date(Date.now() + 1000000).toISOString(),
      status: 'completed',
    };
    expect(isJourneyUnlocked(journey)).toBe(true);
  });

  it('returns true when unlock date is in the past', () => {
    const journey = {
      unlock_date: new Date(Date.now() - 1000).toISOString(),
      status: 'active',
    };
    expect(isJourneyUnlocked(journey)).toBe(true);
  });

  it('returns false when unlock date is in the future', () => {
    const journey = {
      unlock_date: new Date(Date.now() + 1000000).toISOString(),
      status: 'active',
    };
    expect(isJourneyUnlocked(journey)).toBe(false);
  });
});

describe('formatDuration', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(30)).toBe('0:30');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3661)).toBe('61:01');
  });
});

describe('truncate', () => {
  it('returns the original string if shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis if longer than maxLength', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('handles edge cases', () => {
    expect(truncate('hi', 2)).toBe('hi');
    expect(truncate('hello', 5)).toBe('hello');
  });
});

