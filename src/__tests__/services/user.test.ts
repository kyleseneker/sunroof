/**
 * User Service tests
 */

import {
  getUserIdByEmail,
  exportUserData,
  deleteUserAccount,
} from '@/services/user';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
    auth: {
      signOut: jest.fn(() => Promise.resolve()),
    },
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

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserIdByEmail', () => {
    it('returns user ID for valid email', async () => {
      supabase.rpc.mockResolvedValue({
        data: 'user-123',
        error: null,
      });

      const result = await getUserIdByEmail('test@example.com');

      expect(result.error).toBeNull();
      expect(result.data).toBe('user-123');
      expect(supabase.rpc).toHaveBeenCalledWith('get_user_id_by_email', {
        email_input: 'test@example.com',
      });
    });

    it('normalizes email to lowercase and trims whitespace', async () => {
      supabase.rpc.mockResolvedValue({
        data: 'user-123',
        error: null,
      });

      await getUserIdByEmail('  TEST@Example.COM  ');

      expect(supabase.rpc).toHaveBeenCalledWith('get_user_id_by_email', {
        email_input: 'test@example.com',
      });
    });

    it('handles not found error', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const result = await getUserIdByEmail('notfound@example.com');

      expect(result.data).toBeNull();
      expect(result.error).toBe('User not found');
    });

    it('handles exceptions gracefully', async () => {
      supabase.rpc.mockRejectedValue(new Error('Network error'));

      const result = await getUserIdByEmail('test@example.com');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to find user');
    });
  });

  describe('exportUserData', () => {
    it('exports journeys and memories', async () => {
      const mockJourneys = [
        { id: 'journey-1', name: 'Trip 1' },
        { id: 'journey-2', name: 'Trip 2' },
      ];
      const mockMemories = [
        { id: 'memory-1', journey_id: 'journey-1' },
        { id: 'memory-2', journey_id: 'journey-2' },
      ];

      supabase.from.mockImplementation((table: string) => {
        if (table === 'journeys') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockResolvedValue({ data: mockJourneys, error: null }),
            }),
          };
        }
        if (table === 'memories') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockMemories, error: null }),
            }),
          };
        }
        return {};
      });

      const result = await exportUserData('user-123');

      expect(result.error).toBeNull();
      expect(result.data?.journeys).toHaveLength(2);
      expect(result.data?.memories).toHaveLength(2);
      expect(result.data?.exportedAt).toBeTruthy();
    });

    it('handles journeys fetch error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      const result = await exportUserData('user-123');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Database error');
    });

    it('returns empty memories when no journeys', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await exportUserData('user-123');

      expect(result.error).toBeNull();
      expect(result.data?.journeys).toEqual([]);
      expect(result.data?.memories).toEqual([]);
    });
  });

  describe('deleteUserAccount', () => {
    it('deletes all user data and signs out', async () => {
      const mockJourneys = [{ id: 'journey-1' }, { id: 'journey-2' }];

      supabase.from.mockImplementation((table: string) => {
        if (table === 'journeys') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockJourneys, error: null }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'memories') {
          return {
            delete: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      const result = await deleteUserAccount('user-123');

      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('handles no journeys gracefully', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await deleteUserAccount('user-123');

      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    });

    it('handles exceptions', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await deleteUserAccount('user-123');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to delete account');
    });
  });
});
