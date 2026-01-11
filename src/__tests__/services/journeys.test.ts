/**
 * Journey Service tests
 */

import {
  createJourney,
  updateJourney,
  deleteJourney,
  fetchActiveJourneys,
  fetchPastJourneys,
} from '@/services/journeys';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(() => ({
        remove: jest.fn(() => Promise.resolve({ error: null })),
      })),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock location (imports logger)
jest.mock('@/lib/location', () => ({
  getLocationContext: jest.fn(),
}));

jest.mock('@/lib/notifications', () => ({
  cancelJourneyNotifications: jest.fn(() => Promise.resolve()),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabase } = require('@/lib/supabase');

describe('Journey Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createJourney', () => {
    it('creates a journey successfully', async () => {
      const mockJourney = {
        id: 'journey-1',
        user_id: 'user-1',
        name: 'Test Journey',
        destination: 'Paris',
        unlock_date: '2025-01-01T00:00:00Z',
        status: 'active',
        emoji: '🌍',
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockJourney, error: null }),
          }),
        }),
      });

      const result = await createJourney({
        userId: 'user-1',
        name: 'Test Journey',
        destination: 'Paris',
        unlockDate: '2025-01-01T00:00:00Z',
        emoji: '🌍',
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockJourney);
      expect(supabase.from).toHaveBeenCalledWith('journeys');
    });

    it('trims name and destination', async () => {
      const mockJourney = {
        id: 'journey-1',
        name: 'Trimmed Name',
        destination: 'Trimmed Destination',
      };

      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockJourney, error: null }),
        }),
      });

      supabase.from.mockReturnValue({ insert: insertMock });

      await createJourney({
        userId: 'user-1',
        name: '  Trimmed Name  ',
        destination: '  Trimmed Destination  ',
        unlockDate: '2025-01-01T00:00:00Z',
      });

      expect(insertMock).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Trimmed Name',
          destination: 'Trimmed Destination',
        }),
      ]);
    });

    it('handles null destination', async () => {
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 'journey-1' }, error: null }),
        }),
      });

      supabase.from.mockReturnValue({ insert: insertMock });

      await createJourney({
        userId: 'user-1',
        name: 'Test Journey',
        unlockDate: '2025-01-01T00:00:00Z',
      });

      expect(insertMock).toHaveBeenCalledWith([
        expect.objectContaining({
          destination: null,
        }),
      ]);
    });

    it('returns error on Supabase failure', async () => {
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const result = await createJourney({
        userId: 'user-1',
        name: 'Test',
        unlockDate: '2025-01-01T00:00:00Z',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });

    it('handles exceptions gracefully', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await createJourney({
        userId: 'user-1',
        name: 'Test',
        unlockDate: '2025-01-01T00:00:00Z',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to create journey');
    });
  });

  describe('updateJourney', () => {
    it('updates a journey successfully', async () => {
      const mockJourney = {
        id: 'journey-1',
        name: 'Updated Name',
      };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockJourney, error: null }),
            }),
          }),
        }),
      });

      const result = await updateJourney({
        id: 'journey-1',
        name: 'Updated Name',
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockJourney);
    });

    it('only updates provided fields', async () => {
      const updateMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      });

      supabase.from.mockReturnValue({ update: updateMock });

      await updateJourney({
        id: 'journey-1',
        name: 'New Name',
        // destination not provided - should not be updated
      });

      expect(updateMock).toHaveBeenCalledWith({ name: 'New Name' });
    });

    it('handles empty sharedWith array', async () => {
      const updateMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      });

      supabase.from.mockReturnValue({ update: updateMock });

      await updateJourney({
        id: 'journey-1',
        sharedWith: [],
      });

      expect(updateMock).toHaveBeenCalledWith({ shared_with: null });
    });

    it('returns error on failure', async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      });

      const result = await updateJourney({
        id: 'journey-1',
        name: 'New Name',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteJourney', () => {
    it('deletes a journey and its memories', async () => {
      const mockMemories = [
        { url: 'https://storage/sunroof-media/photos/1.jpg', type: 'photo' },
        { url: 'https://storage/sunroof-media/videos/2.mp4', type: 'video' },
        { url: null, type: 'text' },
      ];

      // Mock fetching memories
      supabase.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockMemories, error: null }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'journeys') {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      const result = await deleteJourney('journey-1');

      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    });

    it('continues if storage cleanup fails', async () => {
      supabase.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ url: 'https://storage/sunroof-media/photo.jpg', type: 'photo' }],
                error: null,
              }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'journeys') {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      supabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({ error: { message: 'Storage error' } }),
      });

      const result = await deleteJourney('journey-1');

      // Should still succeed - storage cleanup is secondary
      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    });
  });

  // Note: fetchActiveJourneys and fetchPastJourneys have complex Supabase query chains
  // that are difficult to mock reliably. For thorough testing of these functions,
  // integration tests with a real Supabase instance are recommended.
  // The core logic (deduplication, memory counting) is tested via the helper functions.
});

