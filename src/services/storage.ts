/**
 * Storage Service for uploading media
 */

import RNFS from 'react-native-fs';
import { supabase, createLogger } from '@/lib';
import type { ServiceResult } from './types';

const log = createLogger('StorageService');

export interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Supported media types for upload
 */
type MediaType = 'photo' | 'video' | 'audio';

interface MediaConfig {
  extension: string;
  contentType: string;
  errorMessage: string;
}

const MEDIA_CONFIG: Record<MediaType, MediaConfig> = {
  photo: {
    extension: 'jpg',
    contentType: 'image/jpeg',
    errorMessage: 'Failed to upload photo',
  },
  video: {
    extension: 'mp4',
    contentType: 'video/mp4',
    errorMessage: 'Failed to upload video',
  },
  audio: {
    extension: 'm4a',
    contentType: 'audio/m4a',
    errorMessage: 'Failed to upload audio',
  },
};

const STORAGE_BUCKET = 'sunroof-media';

/**
 * Generate a unique filename for uploads
 */
function generateFilename(extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Normalize file URI by removing file:// prefix
 */
function normalizeUri(uri: string): string {
  return uri.replace('file://', '');
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Core upload function - uploads any media type to Supabase storage
 */
async function uploadMedia(
  userId: string,
  journeyId: string,
  fileUri: string,
  mediaType: MediaType,
  options?: { contentType?: string; extension?: string }
): Promise<ServiceResult<UploadResult>> {
  const config = MEDIA_CONFIG[mediaType];
  const extension = options?.extension ?? config.extension;
  const contentType = options?.contentType ?? config.contentType;

  try {
    const filename = generateFilename(extension);
    const path = `${userId}/${journeyId}/${filename}`;
    const normalizedUri = normalizeUri(fileUri);

    // Read file as base64 and convert to ArrayBuffer
    const base64 = await RNFS.readFile(normalizedUri, 'base64');
    const arrayBuffer = base64ToArrayBuffer(base64);

    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      log.error('Upload error', { mediaType, error: error.message });
      return { data: null, error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    log.debug('Upload successful', { mediaType, path });
    return { data: { path, publicUrl }, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    log.error('Upload exception', { mediaType, error: errorMessage });
    return { data: null, error: config.errorMessage };
  }
}

/**
 * Upload a photo to storage
 */
export function uploadMemoryPhoto(
  userId: string,
  journeyId: string,
  imageUri: string
): Promise<ServiceResult<UploadResult>> {
  return uploadMedia(userId, journeyId, imageUri, 'photo');
}

/**
 * Upload a video to storage
 */
export function uploadMemoryVideo(
  userId: string,
  journeyId: string,
  videoUri: string
): Promise<ServiceResult<UploadResult>> {
  return uploadMedia(userId, journeyId, videoUri, 'video');
}

/**
 * Upload audio to storage
 */
export function uploadMemoryAudio(
  userId: string,
  journeyId: string,
  audioUri: string,
  mimeType = 'audio/m4a'
): Promise<ServiceResult<UploadResult>> {
  const extension = mimeType.includes('m4a') ? 'm4a' : 'webm';
  return uploadMedia(userId, journeyId, audioUri, 'audio', {
    contentType: mimeType,
    extension,
  });
}

/**
 * Delete a file from storage
 */
export async function deleteStorageFile(filePath: string): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

    if (error) {
      log.error('Delete error', { error: error.message, filePath });
      return { data: null, error: error.message };
    }

    log.debug('File deleted', { filePath });
    return { data: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    log.error('Delete exception', { error: errorMessage, filePath });
    return { data: null, error: 'Failed to delete file' };
  }
}
