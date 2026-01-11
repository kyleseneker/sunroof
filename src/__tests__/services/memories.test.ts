/**
 * Memory Service tests
 */

import {
  createMemory,
  deleteMemory,
  fetchMemoriesForJourney,
  addTagToMemory,
  removeTagFromMemory,
  getJourneyTags,
} from '@/services/memories';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabase } = require('@/lib/supabase');

const mockMemory = {
  id: 'memory-1',
  journey_id: 'journey-1',
  type: 'photo',
  url: 'https://example.com/storage/v1/object/public/sunroof-media/user/photo.jpg',
  note: null,
  created_at: '2024-01-01T00:00:00Z',
  tags: ['tag1', 'tag2'],
};

describe('Memory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMemory', () => {
    it('creates a photo memory', async () => {
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockMemory, error: null }),
          }),
        }),
      });

      const result = await createMemory({
        journeyId: 'journey-1',
        type: 'photo',
        imageUrl: 'https://example.com/photo.jpg',
      });

      expect(result.data).toEqual(mockMemory);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('memories');
    });

    it('creates a note memory (mapped to text type)', async () => {
      const noteMemory = { ...mockMemory, type: 'text', note: 'Test note' };
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: noteMemory, error: null }),
          }),
        }),
      });

      const result = await createMemory({
        journeyId: 'journey-1',
        type: 'note',
        content: 'Test note',
      });

      expect(result.data).toEqual(noteMemory);
      expect(result.error).toBeNull();
    });

    it('creates an audio memory with duration', async () => {
      const audioMemory = { ...mockMemory, type: 'audio', duration: 30 };
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: audioMemory, error: null }),
          }),
        }),
      });

      const result = await createMemory({
        journeyId: 'journey-1',
        type: 'audio',
        audioUrl: 'https://example.com/audio.m4a',
        duration: 30,
      });

      expect(result.data).toEqual(audioMemory);
    });

    it('creates a video memory', async () => {
      const videoMemory = { ...mockMemory, type: 'video' };
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: videoMemory, error: null }),
          }),
        }),
      });

      const result = await createMemory({
        journeyId: 'journey-1',
        type: 'video',
        videoUrl: 'https://example.com/video.mp4',
      });

      expect(result.data).toEqual(videoMemory);
    });

    it('handles database error', async () => {
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      });

      const result = await createMemory({
        journeyId: 'journey-1',
        type: 'photo',
        imageUrl: 'https://example.com/photo.jpg',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('DB error');
    });

    it('handles exceptions', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await createMemory({
        journeyId: 'journey-1',
        type: 'photo',
        imageUrl: 'https://example.com/photo.jpg',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to create memory');
    });

    it('includes location data when provided', async () => {
      let insertedData: unknown;
      supabase.from.mockReturnValue({
        insert: jest.fn((data) => {
          insertedData = data;
          return {
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockMemory, error: null }),
            }),
          };
        }),
      });

      await createMemory({
        journeyId: 'journey-1',
        type: 'photo',
        imageUrl: 'https://example.com/photo.jpg',
        latitude: 40.7128,
        longitude: -74.006,
        locationName: 'New York',
      });

      expect(insertedData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            latitude: 40.7128,
            longitude: -74.006,
            location_name: 'New York',
          }),
        ])
      );
    });
  });

  describe('deleteMemory', () => {
    it('deletes memory and storage file', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockMemory, error: null }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      supabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteMemory('memory-1');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(supabase.storage.from).toHaveBeenCalledWith('sunroof-media');
    });

    it('handles text memories without storage file', async () => {
      const textMemory = { ...mockMemory, type: 'text', url: null };
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: textMemory, error: null }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await deleteMemory('memory-1');

      expect(result.data).toBe(true);
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('handles delete error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockMemory, error: null }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
        }),
      });

      supabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteMemory('memory-1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('fetchMemoriesForJourney', () => {
    it('fetches all memories for a journey', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockMemory], error: null }),
          }),
        }),
      });

      const result = await fetchMemoriesForJourney('journey-1');

      expect(result.data).toHaveLength(1);
      expect(result.data![0].id).toBe('memory-1');
      expect(result.error).toBeNull();
    });

    it('returns empty array when no memories', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const result = await fetchMemoriesForJourney('journey-1');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('handles fetch error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Fetch error' } }),
          }),
        }),
      });

      const result = await fetchMemoriesForJourney('journey-1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Fetch error');
    });
  });

  describe('addTagToMemory', () => {
    it('adds a tag to memory', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { tags: ['existing'] }, error: null }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await addTagToMemory('memory-1', 'newtag');

      expect(result.data).toEqual(['existing', 'newtag']);
      expect(result.error).toBeNull();
    });

    it('normalizes tag to lowercase', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { tags: [] }, error: null }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await addTagToMemory('memory-1', 'NewTag');

      expect(result.data).toEqual(['newtag']);
    });

    it('returns empty tag error', async () => {
      const result = await addTagToMemory('memory-1', '   ');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Tag cannot be empty');
    });

    it('does not duplicate existing tags', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { tags: ['existing'] }, error: null }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await addTagToMemory('memory-1', 'existing');

      expect(result.data).toEqual(['existing']);
      expect(supabase.from().update).not.toHaveBeenCalled();
    });
  });

  describe('removeTagFromMemory', () => {
    it('removes a tag from memory', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { tags: ['tag1', 'tag2'] }, error: null }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await removeTagFromMemory('memory-1', 'tag1');

      expect(result.data).toEqual(['tag2']);
      expect(result.error).toBeNull();
    });
  });

  describe('getJourneyTags', () => {
    it('returns unique sorted tags from journey', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: [{ tags: ['beach', 'sunset'] }, { tags: ['sunset', 'nature'] }],
              error: null,
            }),
          }),
        }),
      });

      const result = await getJourneyTags('journey-1');

      expect(result.data).toEqual(['beach', 'nature', 'sunset']);
      expect(result.error).toBeNull();
    });

    it('returns empty array when no tags', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const result = await getJourneyTags('journey-1');

      expect(result.data).toEqual([]);
    });
  });
});
