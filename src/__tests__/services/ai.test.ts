/**
 * AI Service tests
 */

import {
  generateJourneyRecap,
  getJourneyRecap,
  deleteJourneyRecap,
} from '@/services/ai';
import type { Journey, Memory } from '@/types';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
    from: jest.fn(),
  },
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

// Mock location
jest.mock('@/lib/location', () => ({
  getLocationContext: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabase } = require('@/lib/supabase');

const mockJourney: Journey = {
  id: 'journey-1',
  user_id: 'user-1',
  name: 'Paris Trip',
  unlock_date: '2025-01-01T00:00:00Z',
  status: 'completed',
  created_at: '2024-12-01T00:00:00Z',
};

const mockMemories: Memory[] = [
  {
    id: 'memory-1',
    journey_id: 'journey-1',
    type: 'text',
    note: 'What an amazing day!',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'memory-2',
    journey_id: 'journey-1',
    type: 'photo',
    url: 'https://example.com/photo.jpg',
    created_at: '2024-12-01T11:00:00Z',
  },
];

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateJourneyRecap', () => {
    it('generates and saves a recap successfully', async () => {
      const mockRecap = {
        recap: 'Your Paris trip was magical...',
        highlights: ['Visited the Eiffel Tower', 'Had amazing croissants'],
      };

      supabase.functions.invoke.mockResolvedValue({
        data: mockRecap,
        error: null,
      });

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await generateJourneyRecap(mockJourney, mockMemories);

      expect(result.error).toBeNull();
      expect(result.data?.recap).toBe('Your Paris trip was magical...');
      expect(result.data?.highlights).toHaveLength(2);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('generate-recap', {
        body: expect.objectContaining({
          journeyId: 'journey-1',
          journeyName: 'Paris Trip',
        }),
      });
    });

    it('handles function invocation error', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Function timeout' },
      });

      const result = await generateJourneyRecap(mockJourney, mockMemories);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Function timeout');
    });

    it('handles function returning error in data', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { error: 'Insufficient text notes' },
        error: null,
      });

      const result = await generateJourneyRecap(mockJourney, mockMemories);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Insufficient text notes');
    });

    it('handles empty recap', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { recap: null },
        error: null,
      });

      const result = await generateJourneyRecap(mockJourney, mockMemories);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to generate recap');
    });

    it('still returns recap if database save fails', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { recap: 'Great trip!', highlights: [] },
        error: null,
      });

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
        }),
      });

      const result = await generateJourneyRecap(mockJourney, mockMemories);

      // Should still return the recap even if save fails
      expect(result.error).toBeNull();
      expect(result.data?.recap).toBe('Great trip!');
    });

    it('handles exceptions', async () => {
      supabase.functions.invoke.mockRejectedValue(new Error('Network error'));

      const result = await generateJourneyRecap(mockJourney, mockMemories);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to generate recap');
    });
  });

  describe('getJourneyRecap', () => {
    it('returns existing recap', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                ai_recap: 'Previously generated recap',
                ai_recap_highlights: ['Highlight 1'],
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await getJourneyRecap('journey-1');

      expect(result.error).toBeNull();
      expect(result.data?.recap).toBe('Previously generated recap');
      expect(result.data?.highlights).toEqual(['Highlight 1']);
    });

    it('returns null when no recap exists', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ai_recap: null, ai_recap_highlights: null },
              error: null,
            }),
          }),
        }),
      });

      const result = await getJourneyRecap('journey-1');

      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });

    it('handles fetch error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      const result = await getJourneyRecap('journey-1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Not found');
    });
  });

  describe('deleteJourneyRecap', () => {
    it('deletes recap successfully', async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await deleteJourneyRecap('journey-1');

      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    });

    it('handles delete error', async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      });

      const result = await deleteJourneyRecap('journey-1');

      expect(result.data).toBe(false);
      expect(result.error).toBe('Delete failed');
    });

    it('handles exceptions', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await deleteJourneyRecap('journey-1');

      expect(result.data).toBe(false);
      expect(result.error).toBe('Failed to delete recap');
    });
  });
});
