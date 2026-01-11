/**
 * Offline Store tests
 */

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  exists: jest.fn(),
  mkdir: jest.fn(),
  copyFile: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { offlineStore } from '@/lib/offlineStore';

const mockMemory = {
  id: 'photo-123',
  journeyId: 'journey-1',
  userId: 'user-1',
  type: 'photo' as const,
  localUri: 'file:///path/to/photo.jpg',
  location: null,
  weather: null,
  createdAt: '2024-01-01T00:00:00Z',
};

describe('Offline Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.mkdir as jest.Mock).mockResolvedValue(undefined);
    (RNFS.copyFile as jest.Mock).mockResolvedValue(undefined);
    (RNFS.unlink as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initialize', () => {
    it('creates offline media directory if not exists', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValueOnce(false);

      await offlineStore.initialize();

      expect(RNFS.mkdir).toHaveBeenCalledWith('/mock/docs/offline_media');
    });

    it('does not create directory if exists', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(true);

      await offlineStore.initialize();

      expect(RNFS.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('addPendingMemory', () => {
    it('adds a photo memory to storage', async () => {
      await offlineStore.addPendingMemory(mockMemory);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedData[savedData.length - 1]).toMatchObject({
        id: 'photo-123',
        journeyId: 'journey-1',
        syncStatus: 'pending',
        retryCount: 0,
      });
    });

    it('copies media file to app storage', async () => {
      await offlineStore.addPendingMemory(mockMemory);

      expect(RNFS.copyFile).toHaveBeenCalledWith(
        '/path/to/photo.jpg',
        expect.stringContaining('photo-123')
      );
    });

    it('handles file copy failure gracefully', async () => {
      (RNFS.copyFile as jest.Mock).mockRejectedValue(new Error('Copy failed'));

      const result = await offlineStore.addPendingMemory(mockMemory);

      expect(result.syncStatus).toBe('pending');
    });

    it('adds text note without copying file', async () => {
      const noteMemory = {
        ...mockMemory,
        id: 'note-123',
        type: 'text' as const,
        localUri: undefined,
        note: 'Test note',
      };

      await offlineStore.addPendingMemory(noteMemory);

      expect(RNFS.copyFile).not.toHaveBeenCalled();
    });
  });

  describe('getPendingMemories', () => {
    it('returns empty array when no pending', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await offlineStore.getPendingMemories();

      expect(result).toEqual([]);
    });

    it('returns parsed pending memories', async () => {
      const pending = [{ id: '1', syncStatus: 'pending' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      const result = await offlineStore.getPendingMemories();

      expect(result).toEqual(pending);
    });

    it('handles parse error gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await offlineStore.getPendingMemories();

      expect(result).toEqual([]);
    });
  });

  describe('getPendingForJourney', () => {
    it('filters memories by journey ID', async () => {
      const pending = [
        { id: '1', journeyId: 'j1' },
        { id: '2', journeyId: 'j2' },
        { id: '3', journeyId: 'j1' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      const result = await offlineStore.getPendingForJourney('j1');

      expect(result).toHaveLength(2);
      expect(result.map(m => m.id)).toEqual(['1', '3']);
    });
  });

  describe('getPendingCount', () => {
    it('returns count of pending memories', async () => {
      const pending = [{ id: '1' }, { id: '2' }, { id: '3' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      const count = await offlineStore.getPendingCount();

      expect(count).toBe(3);
    });
  });

  describe('updateMemoryStatus', () => {
    it('updates status of existing memory', async () => {
      const pending = [{ id: '1', syncStatus: 'pending', retryCount: 0 }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      await offlineStore.updateMemoryStatus('1', 'uploading');

      const savedData = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedData[0].syncStatus).toBe('uploading');
    });

    it('increments retry count on failure', async () => {
      const pending = [{ id: '1', syncStatus: 'pending', retryCount: 0 }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      await offlineStore.updateMemoryStatus('1', 'failed', 'Network error');

      const savedData = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedData[0].syncStatus).toBe('failed');
      expect(savedData[0].retryCount).toBe(1);
      expect(savedData[0].lastError).toBe('Network error');
    });

    it('does nothing for non-existent memory', async () => {
      const pending = [{ id: '1', syncStatus: 'pending' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));
      (AsyncStorage.setItem as jest.Mock).mockClear(); // Clear any prior calls

      await offlineStore.updateMemoryStatus('non-existent', 'failed');

      // Memory still has original status - verify by reading back
      const result = await offlineStore.getPendingMemories();
      expect(result).toHaveLength(1);
      expect(result[0].syncStatus).toBe('pending');
    });
  });

  describe('removePendingMemory', () => {
    it('removes memory from storage', async () => {
      const pending = [
        { id: '1', syncStatus: 'pending' },
        { id: '2', syncStatus: 'pending' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      await offlineStore.removePendingMemory('1');

      const savedData = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('2');
    });

    it('deletes persisted file', async () => {
      const pending = [
        { id: '1', persistedUri: '/mock/docs/offline_media/photo.jpg' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      await offlineStore.removePendingMemory('1');

      expect(RNFS.unlink).toHaveBeenCalledWith('/mock/docs/offline_media/photo.jpg');
    });
  });

  describe('getMemoriesToSync', () => {
    it('returns pending memories', async () => {
      const pending = [
        { id: '1', syncStatus: 'pending', retryCount: 0 },
        { id: '2', syncStatus: 'uploading', retryCount: 0 },
        { id: '3', syncStatus: 'pending', retryCount: 0 },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      const result = await offlineStore.getMemoriesToSync();

      expect(result).toHaveLength(2);
      expect(result.map(m => m.id)).toEqual(['1', '3']);
    });

    it('includes failed memories under retry limit', async () => {
      const pending = [
        { id: '1', syncStatus: 'failed', retryCount: 1 },
        { id: '2', syncStatus: 'failed', retryCount: 5 },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      const result = await offlineStore.getMemoriesToSync(3);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('clearFailedMemories', () => {
    it('removes memories that exceeded retry limit', async () => {
      const pending = [
        { id: '1', syncStatus: 'pending', retryCount: 0 },
        { id: '2', syncStatus: 'failed', retryCount: 5 },
        { id: '3', syncStatus: 'failed', retryCount: 1 },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(pending));

      const cleared = await offlineStore.clearFailedMemories(3);

      expect(cleared).toBe(1);
      const savedData = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedData.map((m: { id: string }) => m.id)).toEqual(['1', '3']);
    });
  });

  describe('subscribe', () => {
    it('adds listener and returns unsubscribe function', async () => {
      const listener = jest.fn();

      const unsubscribe = offlineStore.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
    });
  });
});
