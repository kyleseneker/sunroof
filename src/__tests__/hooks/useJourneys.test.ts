/**
 * useJourneys hook tests
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useJourneys } from '@/hooks/useJourneys';

// Mock the services
jest.mock('@/services', () => ({
  fetchActiveJourneys: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 'journey-1',
          name: 'Test Journey',
          status: 'active',
          unlock_date: '2025-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          memory_count: 5,
        },
      ],
      error: null,
    })
  ),
  fetchPastJourneys: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 'journey-2',
          name: 'Past Journey',
          status: 'completed',
          unlock_date: '2023-01-01T00:00:00Z',
          created_at: '2022-01-01T00:00:00Z',
          memory_count: 10,
        },
      ],
      error: null,
    })
  ),
}));

// Mock journey cache
jest.mock('@/lib', () => ({
  getCachedActiveJourneys: jest.fn(() => ({ data: null, isFresh: false })),
  getCachedPastJourneys: jest.fn(() => ({ data: null, isFresh: false })),
  setCachedActiveJourneys: jest.fn(),
  setCachedPastJourneys: jest.fn(),
  invalidateJourneyCache: jest.fn(),
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('useJourneys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useJourneys('user-123'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activeJourneys).toEqual([]);
    expect(result.current.pastJourneys).toEqual([]);
  });

  it('fetches journeys when userId is provided', async () => {
    const { result } = renderHook(() => useJourneys('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeJourneys).toHaveLength(1);
    expect(result.current.activeJourneys[0].name).toBe('Test Journey');
    expect(result.current.pastJourneys).toHaveLength(1);
    expect(result.current.pastJourneys[0].name).toBe('Past Journey');
  });

  it('does not fetch and sets loading false when userId is undefined', async () => {
    const { result } = renderHook(() => useJourneys(undefined));

    // When userId is undefined, loading should be set to false immediately
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeJourneys).toEqual([]);
    expect(result.current.pastJourneys).toEqual([]);
  });

  it('provides a refresh function', async () => {
    const { result } = renderHook(() => useJourneys('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe('function');
  });

  it('provides an invalidate function', async () => {
    const { result } = renderHook(() => useJourneys('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.invalidate).toBe('function');
  });

  it('handles errors gracefully', async () => {
    // Mock an error response
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { fetchActiveJourneys } = require('@/services');
    fetchActiveJourneys.mockImplementationOnce(() =>
      Promise.resolve({
        data: null,
        error: 'Network error',
      })
    );

    const { result } = renderHook(() => useJourneys('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Error should be set when network fetch fails
    expect(result.current.error).toBe('Network error');
  });

  it('uses cached data when available', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCachedActiveJourneys, getCachedPastJourneys } = require('@/lib');

    // Return fresh cached data
    getCachedActiveJourneys.mockReturnValueOnce({
      data: [{ id: 'cached-1', name: 'Cached Journey' }],
      isFresh: true,
    });
    getCachedPastJourneys.mockReturnValueOnce({
      data: [],
      isFresh: true,
    });

    const { result } = renderHook(() => useJourneys('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should use cached data
    expect(result.current.activeJourneys).toHaveLength(1);
    expect(result.current.activeJourneys[0].name).toBe('Cached Journey');
  });
});
