/**
 * Storage Service tests
 */

import {
  uploadMemoryPhoto,
  uploadMemoryVideo,
  uploadMemoryAudio,
  deleteStorageFile,
} from '@/services/storage';

// Mock RNFS
jest.mock('react-native-fs', () => ({
  readFile: jest.fn(() => Promise.resolve('base64EncodedContent==')),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(),
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

// Mock location (imports logger)
jest.mock('@/lib/location', () => ({
  getLocationContext: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabase } = require('@/lib/supabase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RNFS = require('react-native-fs');

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset RNFS mock
    RNFS.readFile.mockResolvedValue('base64EncodedContent==');
  });

  describe('uploadMemoryPhoto', () => {
    it('uploads a photo successfully', async () => {
      const mockPublicUrl = 'https://storage.example.com/user-1/journey-1/photo.jpg';

      supabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      });

      const result = await uploadMemoryPhoto(
        'user-1',
        'journey-1',
        'file:///path/to/photo.jpg'
      );

      expect(result.error).toBeNull();
      expect(result.data?.publicUrl).toBe(mockPublicUrl);
      expect(result.data?.path).toMatch(/^user-1\/journey-1\/\d+-\w+\.jpg$/);
    });

    it('removes file:// prefix from URI', async () => {
      supabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/photo.jpg' },
        }),
      });

      await uploadMemoryPhoto('user-1', 'journey-1', 'file:///path/to/photo.jpg');

      expect(RNFS.readFile).toHaveBeenCalledWith('/path/to/photo.jpg', 'base64');
    });

    it('handles upload errors', async () => {
      supabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          error: { message: 'Upload failed' },
        }),
      });

      const result = await uploadMemoryPhoto(
        'user-1',
        'journey-1',
        'file:///path/to/photo.jpg'
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('Upload failed');
    });

    it('handles file read errors', async () => {
      RNFS.readFile.mockRejectedValue(new Error('File not found'));

      supabase.storage.from.mockReturnValue({
        upload: jest.fn(),
      });

      const result = await uploadMemoryPhoto(
        'user-1',
        'journey-1',
        'file:///nonexistent/photo.jpg'
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to upload photo');
    });
  });

  describe('uploadMemoryVideo', () => {
    it('uploads a video successfully', async () => {
      const mockPublicUrl = 'https://storage.example.com/user-1/journey-1/video.mp4';

      supabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      });

      const result = await uploadMemoryVideo(
        'user-1',
        'journey-1',
        'file:///path/to/video.mp4'
      );

      expect(result.error).toBeNull();
      expect(result.data?.publicUrl).toBe(mockPublicUrl);
      expect(result.data?.path).toMatch(/\.mp4$/);
    });

    it('uses correct content type', async () => {
      const uploadMock = jest.fn().mockResolvedValue({ error: null });

      supabase.storage.from.mockReturnValue({
        upload: uploadMock,
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/video.mp4' },
        }),
      });

      await uploadMemoryVideo('user-1', 'journey-1', 'file:///path/to/video.mp4');

      expect(uploadMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(ArrayBuffer),
        expect.objectContaining({
          contentType: 'video/mp4',
        })
      );
    });
  });

  describe('uploadMemoryAudio', () => {
    it('uploads audio with default m4a format', async () => {
      const mockPublicUrl = 'https://storage.example.com/user-1/journey-1/audio.m4a';

      supabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      });

      const result = await uploadMemoryAudio(
        'user-1',
        'journey-1',
        'file:///path/to/audio.m4a'
      );

      expect(result.error).toBeNull();
      expect(result.data?.path).toMatch(/\.m4a$/);
    });

    it('supports webm format', async () => {
      const uploadMock = jest.fn().mockResolvedValue({ error: null });

      supabase.storage.from.mockReturnValue({
        upload: uploadMock,
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/audio.webm' },
        }),
      });

      const result = await uploadMemoryAudio(
        'user-1',
        'journey-1',
        'file:///path/to/audio.webm',
        'audio/webm'
      );

      expect(result.error).toBeNull();
      expect(uploadMock).toHaveBeenCalledWith(
        expect.stringMatching(/\.webm$/),
        expect.any(ArrayBuffer),
        expect.objectContaining({
          contentType: 'audio/webm',
        })
      );
    });
  });

  describe('deleteStorageFile', () => {
    it('deletes a file successfully', async () => {
      supabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteStorageFile('user-1/journey-1/photo.jpg');

      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    });

    it('handles deletion errors', async () => {
      supabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: { message: 'File not found' },
        }),
      });

      const result = await deleteStorageFile('user-1/journey-1/nonexistent.jpg');

      expect(result.data).toBeNull();
      expect(result.error).toBe('File not found');
    });

    it('handles exceptions', async () => {
      supabase.storage.from.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await deleteStorageFile('user-1/journey-1/photo.jpg');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to delete file');
    });
  });
});

