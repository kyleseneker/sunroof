/**
 * Upload Queue tests
 */

import { uploadQueue } from '@/lib/uploadQueue';

// Mock dependencies
jest.mock('@/lib/offlineStore', () => ({
  offlineStore: {
    addPendingMemory: jest.fn((input) => Promise.resolve({ ...input, status: 'pending' })),
    getPendingCount: jest.fn().mockResolvedValue(0),
    subscribe: jest.fn(() => jest.fn()),
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

import { offlineStore } from '@/lib/offlineStore';

describe('Upload Queue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addPhoto', () => {
    it('adds a photo to the offline store', async () => {
      const result = await uploadQueue.addPhoto({
        journeyId: 'journey-1',
        userId: 'user-1',
        localUri: 'file:///photo.jpg',
      });

      expect(offlineStore.addPendingMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'photo',
          journeyId: 'journey-1',
          userId: 'user-1',
          localUri: 'file:///photo.jpg',
        })
      );
      expect(result.type).toBe('photo');
    });

    it('includes location data when provided', async () => {
      const location = { latitude: 40.7128, longitude: -74.006, name: 'New York' };

      await uploadQueue.addPhoto({
        journeyId: 'journey-1',
        userId: 'user-1',
        localUri: 'file:///photo.jpg',
        location,
      });

      expect(offlineStore.addPendingMemory).toHaveBeenCalledWith(
        expect.objectContaining({ location })
      );
    });

    it('includes weather data when provided', async () => {
      const weather = { temp: 72, condition: 'Sunny', icon: '☀️' };

      await uploadQueue.addPhoto({
        journeyId: 'journey-1',
        userId: 'user-1',
        localUri: 'file:///photo.jpg',
        weather,
      });

      expect(offlineStore.addPendingMemory).toHaveBeenCalledWith(
        expect.objectContaining({ weather })
      );
    });

    it('includes tags when provided', async () => {
      await uploadQueue.addPhoto({
        journeyId: 'journey-1',
        userId: 'user-1',
        localUri: 'file:///photo.jpg',
        tags: ['sunset', 'beach'],
      });

      expect(offlineStore.addPendingMemory).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['sunset', 'beach'] })
      );
    });
  });

  describe('addVideo', () => {
    it('adds a video with duration', async () => {
      const result = await uploadQueue.addVideo({
        journeyId: 'journey-1',
        userId: 'user-1',
        localUri: 'file:///video.mp4',
        duration: 30,
      });

      expect(offlineStore.addPendingMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'video',
          localUri: 'file:///video.mp4',
          duration: 30,
        })
      );
      expect(result.type).toBe('video');
    });
  });

  describe('addAudio', () => {
    it('adds an audio recording with duration', async () => {
      const result = await uploadQueue.addAudio({
        journeyId: 'journey-1',
        userId: 'user-1',
        localUri: 'file:///audio.m4a',
        duration: 60,
      });

      expect(offlineStore.addPendingMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'audio',
          localUri: 'file:///audio.m4a',
          duration: 60,
        })
      );
      expect(result.type).toBe('audio');
    });
  });

  describe('addNote', () => {
    it('adds a text note', async () => {
      const result = await uploadQueue.addNote({
        journeyId: 'journey-1',
        userId: 'user-1',
        note: 'Beautiful sunset today!',
      });

      expect(offlineStore.addPendingMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          note: 'Beautiful sunset today!',
        })
      );
      expect(result.type).toBe('text');
    });
  });

  describe('getQueueLength', () => {
    it('returns pending count from offline store', async () => {
      (offlineStore.getPendingCount as jest.Mock).mockResolvedValue(5);

      const count = await uploadQueue.getQueueLength();

      expect(count).toBe(5);
      expect(offlineStore.getPendingCount).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('adds listener and subscribes to offline store', () => {
      const listener = jest.fn();

      uploadQueue.subscribe(listener);

      expect(offlineStore.subscribe).toHaveBeenCalled();
    });

    it('returns unsubscribe function', () => {
      const listener = jest.fn();
      const mockUnsubscribe = jest.fn();
      (offlineStore.subscribe as jest.Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = uploadQueue.subscribe(listener);
      unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('calls listener when offline store updates', () => {
      const listener = jest.fn();
      let storeCallback: (count: number) => void = () => {};
      (offlineStore.subscribe as jest.Mock).mockImplementation((cb) => {
        storeCallback = cb;
        return jest.fn();
      });

      uploadQueue.subscribe(listener);
      storeCallback(3);

      expect(listener).toHaveBeenCalledWith(3);
    });
  });
});
