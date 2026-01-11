/**
 * Unsplash API tests
 */

import { searchLocationPhoto } from '@/lib/unsplash';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  UNSPLASH_ACCESS_KEY: 'test-access-key',
}));

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

describe('Unsplash', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchLocationPhoto', () => {
    const mockPhotoResult = {
      results: [
        {
          id: 'photo-1',
          urls: {
            raw: 'https://unsplash.com/raw.jpg',
            full: 'https://unsplash.com/full.jpg',
            regular: 'https://unsplash.com/regular.jpg',
            small: 'https://unsplash.com/small.jpg',
          },
          user: {
            name: 'John Photographer',
            username: 'johnphoto',
            links: {
              html: 'https://unsplash.com/@johnphoto',
            },
          },
        },
      ],
      total: 1,
    };

    it('returns photo on successful search', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhotoResult),
      });

      const result = await searchLocationPhoto('mountain landscape');

      expect(result).not.toBeNull();
      expect(result?.photographerName).toBe('John Photographer');
      expect(result?.url).toContain('regular.jpg');
    });

    it('includes proper attribution', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhotoResult),
      });

      const result = await searchLocationPhoto('beach');

      expect(result?.attribution).toBe('Photo by John Photographer on Unsplash');
      expect(result?.photographerUrl).toBe('https://unsplash.com/@johnphoto');
    });

    it('returns null when no results', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [], total: 0 }),
      });

      const result = await searchLocationPhoto('nonexistent query');

      expect(result).toBeNull();
    });

    it('returns null on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error'),
      });

      const result = await searchLocationPhoto('test');

      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await searchLocationPhoto('test');

      expect(result).toBeNull();
    });

    it('constructs correct API URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhotoResult),
      });

      await searchLocationPhoto('sunset beach');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.unsplash.com/search/photos'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=sunset+beach'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('orientation=landscape'),
        expect.any(Object)
      );
    });

    it('includes authorization header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhotoResult),
      });

      await searchLocationPhoto('test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Client-ID test-access-key',
          }),
        })
      );
    });

    it('uses custom access key when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhotoResult),
      });

      // Use unique query to avoid cache hit
      await searchLocationPhoto('unique custom key test query', 'custom-key');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Client-ID custom-key',
          }),
        })
      );
    });

    it('returns cached result on repeat query', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhotoResult),
      });

      // First call
      await searchLocationPhoto('cached query');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call with same query
      await searchLocationPhoto('cached query');
      // Should not have made another fetch
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('cache is case-insensitive', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhotoResult),
      });

      await searchLocationPhoto('Beach Sunset');
      await searchLocationPhoto('beach sunset');
      await searchLocationPhoto('BEACH SUNSET');

      // All should hit the same cache entry
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
