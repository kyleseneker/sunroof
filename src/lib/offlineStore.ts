/**
 * Offline Store
 * Persists pending memories locally for offline-first capture
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import type { MemoryLocation, MemoryWeather } from '@/types';
import { createLogger } from './logger';

const log = createLogger('OfflineStore');

const PENDING_MEMORIES_KEY = '@sunroof_pending_memories';
const OFFLINE_MEDIA_DIR = `${RNFS.DocumentDirectoryPath}/offline_media`;

export type PendingMemoryType = 'photo' | 'video' | 'audio' | 'text';
export type SyncStatus = 'pending' | 'uploading' | 'failed';

export interface PendingMemory {
  id: string;
  journeyId: string;
  userId: string;
  type: PendingMemoryType;
  localUri?: string;
  persistedUri?: string; // Copied to app storage for persistence
  note?: string;
  duration?: number;
  location: MemoryLocation | null;
  weather: MemoryWeather | null;
  tags?: string[];
  createdAt: string;
  syncStatus: SyncStatus;
  retryCount: number;
  lastError?: string;
}

type OfflineStoreListener = (pendingCount: number) => void;

class OfflineStore {
  private listeners: Set<OfflineStoreListener> = new Set();
  private initialized = false;
  private pendingOperations: Promise<void> = Promise.resolve();

  // Serialize async operations to prevent race conditions
  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    let result: T | undefined;
    this.pendingOperations = this.pendingOperations.then(async () => {
      result = await operation();
    });
    await this.pendingOperations;
    // Result is guaranteed to be assigned after awaiting pendingOperations
    return result as T;
  }

  /**
   * Initialize the offline store (create directories, etc.)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure offline media directory exists
      const exists = await RNFS.exists(OFFLINE_MEDIA_DIR);
      if (!exists) {
        await RNFS.mkdir(OFFLINE_MEDIA_DIR);
      }
      this.initialized = true;
      log.debug(' Initialized');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Initialize error', { error: message });
    }
  }

  /**
   * Add a pending memory (saves locally for later sync)
   */
  async addPendingMemory(memory: Omit<PendingMemory, 'syncStatus' | 'retryCount' | 'persistedUri'>): Promise<PendingMemory> {
    await this.initialize();

    let persistedUri: string | undefined;

    // Copy media file to app storage so it persists (outside lock - I/O heavy)
    if (memory.localUri && memory.type !== 'text') {
      try {
        const ext = this.getFileExtension(memory.localUri, memory.type);
        const filename = `${memory.id}${ext}`;
        persistedUri = `${OFFLINE_MEDIA_DIR}/${filename}`;
        
        // Remove file:// prefix if present - RNFS needs raw path
        const sourcePath = memory.localUri.replace(/^file:\/\//, '');
        
        // Check if source exists
        const sourceExists = await RNFS.exists(sourcePath);
        if (!sourceExists) {
          log.warn(' Source file does not exist', { sourcePath });
          persistedUri = memory.localUri;
        } else {
          await RNFS.copyFile(sourcePath, persistedUri);
          log.debug(' Media file copied', { memoryId: memory.id });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        log.error(' Failed to copy media file', { error: message, memoryId: memory.id });
        // Continue without persisted copy - will use original URI
        persistedUri = memory.localUri;
      }
    }

    const pendingMemory: PendingMemory = {
      ...memory,
      persistedUri,
      syncStatus: 'pending',
      retryCount: 0,
    };

    // Use lock to prevent race conditions when reading/writing pending list
    await this.withLock(async () => {
      const pending = await this.getPendingMemories();
      pending.push(pendingMemory);
      await this.savePendingMemories(pending);
    });
    
    this.notifyListeners();

    return pendingMemory;
  }

  /**
   * Get all pending memories
   */
  async getPendingMemories(): Promise<PendingMemory[]> {
    try {
      const json = await AsyncStorage.getItem(PENDING_MEMORIES_KEY);
      return json ? JSON.parse(json) : [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Get pending error', { error: message });
      return [];
    }
  }

  /**
   * Get pending memories for a specific journey
   */
  async getPendingForJourney(journeyId: string): Promise<PendingMemory[]> {
    const all = await this.getPendingMemories();
    return all.filter(m => m.journeyId === journeyId);
  }

  /**
   * Get count of pending memories
   */
  async getPendingCount(): Promise<number> {
    const pending = await this.getPendingMemories();
    return pending.length;
  }

  /**
   * Update a pending memory's status
   */
  async updateMemoryStatus(
    id: string,
    status: SyncStatus,
    error?: string
  ): Promise<void> {
    await this.withLock(async () => {
      const pending = await this.getPendingMemories();
      const index = pending.findIndex(m => m.id === id);
      
      if (index !== -1) {
        pending[index].syncStatus = status;
        if (error) {
          pending[index].lastError = error;
        }
        if (status === 'failed') {
          pending[index].retryCount++;
        }
        await this.savePendingMemories(pending);
      }
    });
    this.notifyListeners();
  }

  /**
   * Remove a pending memory (after successful sync)
   */
  async removePendingMemory(id: string): Promise<void> {
    let fileToDelete: string | undefined;
    
    await this.withLock(async () => {
      const pending = await this.getPendingMemories();
      const memory = pending.find(m => m.id === id);
      
      if (memory?.persistedUri) {
        fileToDelete = memory.persistedUri;
      }

      const filtered = pending.filter(m => m.id !== id);
      await this.savePendingMemories(filtered);
    });
    
    // Clean up persisted file outside lock
    if (fileToDelete) {
      try {
        const exists = await RNFS.exists(fileToDelete);
        if (exists) {
          await RNFS.unlink(fileToDelete);
          log.debug(' Persisted file deleted', { path: fileToDelete });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        log.error(' Failed to delete persisted file', { error: message });
      }
    }
    
    this.notifyListeners();
  }

  /**
   * Get memories that need syncing (pending or failed with retries left)
   */
  async getMemoriesToSync(maxRetries: number = 3): Promise<PendingMemory[]> {
    const pending = await this.getPendingMemories();
    return pending.filter(
      m => m.syncStatus === 'pending' || 
           (m.syncStatus === 'failed' && m.retryCount < maxRetries)
    );
  }

  /**
   * Clear all failed memories that exceeded retry limit
   */
  async clearFailedMemories(maxRetries: number = 3): Promise<number> {
    const pending = await this.getPendingMemories();
    const failed = pending.filter(
      m => m.syncStatus === 'failed' && m.retryCount >= maxRetries
    );
    
    // Clean up files
    for (const memory of failed) {
      if (memory.persistedUri) {
        try {
          const exists = await RNFS.exists(memory.persistedUri);
          if (exists) {
            await RNFS.unlink(memory.persistedUri);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          log.error(' Failed to delete file during cleanup', { error: message });
        }
      }
    }

    const remaining = pending.filter(
      m => !(m.syncStatus === 'failed' && m.retryCount >= maxRetries)
    );
    await this.savePendingMemories(remaining);
    this.notifyListeners();

    return failed.length;
  }

  /**
   * Subscribe to pending count changes
   */
  subscribe(listener: OfflineStoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async savePendingMemories(memories: PendingMemory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PENDING_MEMORIES_KEY, JSON.stringify(memories));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Save error', { error: message, count: memories.length });
    }
  }

  private async notifyListeners(): Promise<void> {
    const count = await this.getPendingCount();
    this.listeners.forEach(listener => listener(count));
  }

  private getFileExtension(uri: string, type: PendingMemoryType): string {
    // Try to extract from URI
    const match = uri.match(/\.([a-zA-Z0-9]+)$/);
    if (match) return `.${match[1]}`;

    // Fallback based on type
    switch (type) {
      case 'photo': return '.jpg';
      case 'video': return '.mp4';
      case 'audio': return '.m4a';
      default: return '';
    }
  }
}

// Singleton instance
export const offlineStore = new OfflineStore();

