/**
 * Background Upload Queue
 * Handles uploads in the background with offline-first support
 * 
 * All captures are immediately saved to the offline store, then synced
 * when connectivity is available. This ensures no data loss.
 */

import { offlineStore, type PendingMemory } from './offlineStore';
import { createLogger } from './logger';
import type { MemoryLocation, MemoryWeather } from '@/types';

const log = createLogger('UploadQueue');

type UploadListener = (queueLength: number, error?: string) => void;

class UploadQueue {
  private listeners: Set<UploadListener> = new Set();

  /**
   * Add a photo to the upload queue (offline-first)
   */
  async addPhoto(params: {
    journeyId: string;
    userId: string;
    localUri: string;
    location?: MemoryLocation | null;
    weather?: MemoryWeather | null;
    tags?: string[];
  }): Promise<PendingMemory> {
    const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const memory = await offlineStore.addPendingMemory({
      id,
      type: 'photo',
      journeyId: params.journeyId,
      userId: params.userId,
      localUri: params.localUri,
      location: params.location || null,
      weather: params.weather || null,
      tags: params.tags,
      createdAt: new Date().toISOString(),
    });

    log.debug('Photo queued', { id, journeyId: params.journeyId });
    this.notifyListeners();
    return memory;
  }

  /**
   * Add a video to the upload queue (offline-first)
   */
  async addVideo(params: {
    journeyId: string;
    userId: string;
    localUri: string;
    duration: number;
    location?: MemoryLocation | null;
    weather?: MemoryWeather | null;
    tags?: string[];
  }): Promise<PendingMemory> {
    const id = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const memory = await offlineStore.addPendingMemory({
      id,
      type: 'video',
      journeyId: params.journeyId,
      userId: params.userId,
      localUri: params.localUri,
      duration: params.duration,
      location: params.location || null,
      weather: params.weather || null,
      tags: params.tags,
      createdAt: new Date().toISOString(),
    });

    log.debug('Video queued', { id, journeyId: params.journeyId, duration: params.duration });
    this.notifyListeners();
    return memory;
  }

  /**
   * Add an audio recording to the upload queue (offline-first)
   */
  async addAudio(params: {
    journeyId: string;
    userId: string;
    localUri: string;
    duration: number;
    location?: MemoryLocation | null;
    weather?: MemoryWeather | null;
    tags?: string[];
  }): Promise<PendingMemory> {
    const id = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const memory = await offlineStore.addPendingMemory({
      id,
      type: 'audio',
      journeyId: params.journeyId,
      userId: params.userId,
      localUri: params.localUri,
      duration: params.duration,
      location: params.location || null,
      weather: params.weather || null,
      tags: params.tags,
      createdAt: new Date().toISOString(),
    });

    log.debug('Audio queued', { id, journeyId: params.journeyId, duration: params.duration });
    this.notifyListeners();
    return memory;
  }

  /**
   * Add a text note to the upload queue (offline-first)
   */
  async addNote(params: {
    journeyId: string;
    userId: string;
    note: string;
    location?: MemoryLocation | null;
    weather?: MemoryWeather | null;
    tags?: string[];
  }): Promise<PendingMemory> {
    const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const memory = await offlineStore.addPendingMemory({
      id,
      type: 'text',
      journeyId: params.journeyId,
      userId: params.userId,
      note: params.note,
      location: params.location || null,
      weather: params.weather || null,
      tags: params.tags,
      createdAt: new Date().toISOString(),
    });

    log.debug('Note queued', { id, journeyId: params.journeyId });
    this.notifyListeners();
    return memory;
  }

  /**
   * Get current queue length
   */
  async getQueueLength(): Promise<number> {
    return offlineStore.getPendingCount();
  }

  /**
   * Subscribe to queue updates
   */
  subscribe(listener: UploadListener): () => void {
    this.listeners.add(listener);
    
    // Also subscribe to offline store
    const unsubscribe = offlineStore.subscribe(count => {
      listener(count);
    });

    return () => {
      this.listeners.delete(listener);
      unsubscribe();
    };
  }

  private async notifyListeners(error?: string) {
    const count = await offlineStore.getPendingCount();
    this.listeners.forEach(listener => listener(count, error));
  }
}

// Singleton instance
export const uploadQueue = new UploadQueue();

