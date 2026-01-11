/**
 * Offline Provider
 * Manages network state and offline sync functionality
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { offlineStore, type PendingMemory } from '@/lib/offlineStore';
import { createLogger } from '@/lib/logger';
import { uploadMemoryPhoto, uploadMemoryVideo, uploadMemoryAudio, createMemory } from '@/services';

const log = createLogger('OfflineSync');

interface OfflineContextType {
  isOnline: boolean;
  isConnecting: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncProgress: { current: number; total: number } | null;
  needsManualSync: boolean; // True when came back online with pending items
  triggerSync: () => Promise<void>;
  getPendingForJourney: (journeyId: string) => Promise<PendingMemory[]>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

const MAX_RETRIES = 3;

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [needsManualSync, setNeedsManualSync] = useState(false);
  const isSyncingRef = useRef(false);
  const isOnlineRef = useRef(true);
  const previousCountRef = useRef(0);
  const needsManualSyncRef = useRef(false);

  // Initialize and load pending count
  useEffect(() => {
    const init = async () => {
      await offlineStore.initialize();
      const count = await offlineStore.getPendingCount();
      setPendingCount(count);
      previousCountRef.current = count;
      
      // If we launch with pending items, they were from a previous offline session
      if (count > 0) {
        setNeedsManualSync(true);
        needsManualSyncRef.current = true;
      }
    };
    init();

    // Subscribe to pending count changes
    const unsubscribe = offlineStore.subscribe((count) => {
      log.debug(' Pending count updated', { 
        count, 
        isOnline: isOnlineRef.current, 
        needsManualSync: needsManualSyncRef.current,
      });
      setPendingCount(count);
      
      // If count increased while online AND we don't need manual sync, auto-sync
      if (count > previousCountRef.current && isOnlineRef.current && !isSyncingRef.current && !needsManualSyncRef.current) {
        // New item added while online - auto-sync immediately
        log.debug(' New item while online, auto-syncing');
        processSync();
      }
      
      previousCountRef.current = count;
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync a single memory
  const syncMemory = useCallback(async (memory: PendingMemory): Promise<boolean> => {
    const fileUri = memory.persistedUri || memory.localUri;

    try {
      await offlineStore.updateMemoryStatus(memory.id, 'uploading');

      if (memory.type === 'text') {
        // Text notes don't need file upload
        const { error } = await createMemory({
          journeyId: memory.journeyId,
          type: 'note',
          content: memory.note,
          latitude: memory.location?.latitude,
          longitude: memory.location?.longitude,
          locationName: memory.location?.name,
          weather: memory.weather || undefined,
          tags: memory.tags,
        });

        if (error) throw new Error(error);
      } else if (memory.type === 'photo' && fileUri) {
        const { data: uploadData, error: uploadError } = await uploadMemoryPhoto(
          memory.userId,
          memory.journeyId,
          fileUri
        );

        if (uploadError || !uploadData) {
          throw new Error(uploadError || 'Upload failed');
        }

        const { error: createError } = await createMemory({
          journeyId: memory.journeyId,
          type: 'photo',
          imageUrl: uploadData.publicUrl,
          latitude: memory.location?.latitude,
          longitude: memory.location?.longitude,
          locationName: memory.location?.name,
          weather: memory.weather || undefined,
          tags: memory.tags,
        });

        if (createError) throw new Error(createError);
      } else if (memory.type === 'video' && fileUri) {
        const { data: uploadData, error: uploadError } = await uploadMemoryVideo(
          memory.userId,
          memory.journeyId,
          fileUri
        );

        if (uploadError || !uploadData) {
          throw new Error(uploadError || 'Upload failed');
        }

        const { error: createError } = await createMemory({
          journeyId: memory.journeyId,
          type: 'video',
          videoUrl: uploadData.publicUrl,
          duration: memory.duration,
          latitude: memory.location?.latitude,
          longitude: memory.location?.longitude,
          locationName: memory.location?.name,
          weather: memory.weather || undefined,
          tags: memory.tags,
        });

        if (createError) throw new Error(createError);
      } else if (memory.type === 'audio' && fileUri) {
        const { data: uploadData, error: uploadError } = await uploadMemoryAudio(
          memory.userId,
          memory.journeyId,
          fileUri,
          'audio/m4a'
        );

        if (uploadError || !uploadData) {
          throw new Error(uploadError || 'Upload failed');
        }

        const { error: createError } = await createMemory({
          journeyId: memory.journeyId,
          type: 'audio',
          audioUrl: uploadData.publicUrl,
          duration: memory.duration,
          latitude: memory.location?.latitude,
          longitude: memory.location?.longitude,
          locationName: memory.location?.name,
          weather: memory.weather || undefined,
          tags: memory.tags,
        });

        if (createError) throw new Error(createError);
      }

      // Success - remove from pending
      await offlineStore.removePendingMemory(memory.id);
      log.debug(' Memory synced', { memoryId: memory.id, type: memory.type });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Sync failed for memory', { 
        memoryId: memory.id, 
        type: memory.type,
        error: errorMessage,
      });
      await offlineStore.updateMemoryStatus(memory.id, 'failed', errorMessage);
      return false;
    }
  }, []);

  // Process sync queue
  const processSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    
    isSyncingRef.current = true;
    setIsSyncing(true);

    // Keep syncing until queue is empty
    let hasMore = true;
    while (hasMore) {
      const memoriesToSync = await offlineStore.getMemoriesToSync(MAX_RETRIES);
      
      if (memoriesToSync.length === 0) {
        hasMore = false;
        break;
      }

      setSyncProgress({ current: 0, total: memoriesToSync.length });

      for (const memory of memoriesToSync) {
        // Check if still online before each sync
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
          hasMore = false;
          break;
        }

        await syncMemory(memory);
      }
      
      // Check if more items were added during sync
      const remaining = await offlineStore.getMemoriesToSync(MAX_RETRIES);
      hasMore = remaining.length > 0;
    }

    setIsSyncing(false);
    setSyncProgress(null);
    isSyncingRef.current = false;

    // Clean up permanently failed memories
    await offlineStore.clearFailedMemories(MAX_RETRIES);
  }, [syncMemory]);

  // Handle network state changes
  useEffect(() => {
    const handleConnectivityChange = async (state: NetInfoState) => {
      const wasOffline = !isOnlineRef.current;
      const nowOnline = state.isConnected === true;
      
      setIsConnecting(state.isInternetReachable === null && nowOnline);
      setIsOnline(nowOnline);
      isOnlineRef.current = nowOnline;

      // Coming back online with pending items - require manual sync
      if (wasOffline && nowOnline) {
        const count = await offlineStore.getPendingCount();
        if (count > 0) {
          log.info(' Back online with pending items', { count });
          setNeedsManualSync(true);
          needsManualSyncRef.current = true;
        }
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    // Check initial state
    NetInfo.fetch().then(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, []);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (!isOnline) return;
    setNeedsManualSync(false);
    needsManualSyncRef.current = false;
    await processSync();
  }, [isOnline, processSync]);

  // Get pending for a specific journey
  const getPendingForJourney = useCallback(async (journeyId: string) => {
    return offlineStore.getPendingForJourney(journeyId);
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isConnecting,
        pendingCount,
        isSyncing,
        syncProgress,
        needsManualSync,
        triggerSync,
        getPendingForJourney,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

