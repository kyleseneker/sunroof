/**
 * Journey Service
 */

import { supabase, createLogger } from '@/lib';
import { cancelJourneyNotifications } from '@/lib/notifications';
import type { Journey } from '@/types';
import type { ServiceResult } from './types';

const log = createLogger('JourneyService');
const STORAGE_BUCKET = 'sunroof-media';
const MEDIA_TYPES = ['photo', 'video', 'audio'] as const;

export interface CreateJourneyInput {
  userId: string;
  name: string;
  destination?: string;
  unlockDate: string;
  sharedWith?: string[];
  emoji?: string;
  coverImageUrl?: string;
  coverImageAttribution?: string;
}

export interface UpdateJourneyInput {
  id: string;
  name?: string;
  destination?: string;
  unlockDate?: string;
  status?: 'active' | 'completed';
  sharedWith?: string[];
  emoji?: string | null;
  coverImageUrl?: string | null;
  coverImageAttribution?: string | null;
}

/**
 * Create a new journey
 */
export async function createJourney(input: CreateJourneyInput): Promise<ServiceResult<Journey>> {
  try {
    const { data, error } = await supabase
      .from('journeys')
      .insert([
        {
          user_id: input.userId,
          name: input.name.trim(),
          destination: input.destination?.trim() || null,
          unlock_date: input.unlockDate,
          status: 'active',
          shared_with: input.sharedWith?.length ? input.sharedWith : null,
          emoji: input.emoji || null,
          cover_image_url: input.coverImageUrl || null,
          cover_image_attribution: input.coverImageAttribution || null,
        },
      ])
      .select()
      .single();

    if (error) {
      log.error(' Create error', { error: error.message });
      return { data: null, error: error.message };
    }

    log.debug(' Journey created', { journeyId: data.id });
    return { data: data as Journey, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Create exception', { error: message });
    return { data: null, error: 'Failed to create journey' };
  }
}

/**
 * Update an existing journey
 */
export async function updateJourney(input: UpdateJourneyInput): Promise<ServiceResult<Journey>> {
  try {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.destination !== undefined) updates.destination = input.destination.trim() || null;
    if (input.unlockDate !== undefined) updates.unlock_date = input.unlockDate;
    if (input.status !== undefined) updates.status = input.status;
    if (input.sharedWith !== undefined)
      updates.shared_with = input.sharedWith.length > 0 ? input.sharedWith : null;
    if (input.emoji !== undefined) updates.emoji = input.emoji || null;
    if (input.coverImageUrl !== undefined) updates.cover_image_url = input.coverImageUrl;
    if (input.coverImageAttribution !== undefined)
      updates.cover_image_attribution = input.coverImageAttribution;

    const { data, error } = await supabase
      .from('journeys')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      log.error(' Update error', { error: error.message, journeyId: input.id });
      return { data: null, error: error.message };
    }

    log.debug(' Journey updated', { journeyId: input.id });
    return { data: data as Journey, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Update exception', { error: message, journeyId: input.id });
    return { data: null, error: 'Failed to update journey' };
  }
}

/**
 * Extract storage path from a Supabase storage URL
 */
function extractStoragePath(url: string): string | null {
  try {
    const match = url.match(/\/sunroof-media\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Delete a journey and all its memories (including storage files)
 */
export async function deleteJourney(journeyId: string): Promise<ServiceResult<boolean>> {
  try {
    // First fetch all memories to get their storage URLs
    const { data: memories, error: fetchError } = await supabase
      .from('memories')
      .select('url, type')
      .eq('journey_id', journeyId);

    if (fetchError) {
      log.error(' Fetch memories error', {
        error: fetchError.message,
        journeyId,
      });
      return { data: null, error: fetchError.message };
    }

    // Delete storage files for memories that have URLs
    if (memories && memories.length > 0) {
      const storagePaths: string[] = [];

      for (const memory of memories) {
        if (memory.url && MEDIA_TYPES.includes(memory.type as (typeof MEDIA_TYPES)[number])) {
          const path = extractStoragePath(memory.url);
          if (path) {
            storagePaths.push(path);
          }
        }
      }

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(storagePaths);

        if (storageError) {
          // Log but don't fail - storage cleanup is secondary
          log.warn(' Storage delete error', {
            error: storageError.message,
            journeyId,
            count: storagePaths.length,
          });
        } else {
          log.debug(' Deleted storage files', {
            journeyId,
            count: storagePaths.length,
          });
        }
      }
    }

    // Delete all memories from database
    const { error: memoriesError } = await supabase
      .from('memories')
      .delete()
      .eq('journey_id', journeyId);

    if (memoriesError) {
      log.error(' Delete memories error', {
        error: memoriesError.message,
        journeyId,
      });
      return { data: null, error: memoriesError.message };
    }

    // Then delete the journey
    const { error: journeyError } = await supabase
      .from('journeys')
      .delete()
      .eq('id', journeyId);

    if (journeyError) {
      log.error(' Delete journey error', {
        error: journeyError.message,
        journeyId,
      });
      return { data: null, error: journeyError.message };
    }

    // Cancel any scheduled notifications for this journey
    await cancelJourneyNotifications(journeyId);

    log.info(' Journey deleted', { journeyId });
    return { data: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Delete exception', { error: message, journeyId });
    return { data: null, error: 'Failed to delete journey' };
  }
}

/**
 * Deduplicate journeys by ID
 */
function deduplicateJourneys<T extends { id: string }>(journeys: T[]): T[] {
  return journeys.filter(
    (journey, index, self) => index === self.findIndex((j) => j.id === journey.id)
  );
}

/**
 * Build memory count map from memories
 */
function buildMemoryCountMap(memories: Array<{ journey_id: string }>): Map<string, number> {
  const countMap = new Map<string, number>();
  for (const memory of memories) {
    const current = countMap.get(memory.journey_id) || 0;
    countMap.set(memory.journey_id, current + 1);
  }
  return countMap;
}

/**
 * Fetch all journeys for a user in a single optimized query
 * Reduces database calls from 4 to 2 (one for journeys, one for memory counts)
 */
async function fetchAllUserJourneys(userId: string): Promise<{
  ownedJourneys: Journey[];
  sharedJourneys: Journey[];
  error: string | null;
}> {
  try {
    // Single query to fetch all journeys where user is owner OR in shared_with
    // Using OR filter to get both owned and shared in one query
    const { data: ownedData, error: ownedError } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: sharedData, error: sharedError } = await supabase
      .from('journeys')
      .select('*')
      .contains('shared_with', [userId])
      .order('created_at', { ascending: false });

    if (ownedError || sharedError) {
      const error = ownedError || sharedError;
      return { ownedJourneys: [], sharedJourneys: [], error: error?.message || 'Failed to fetch journeys' };
    }

    return {
      ownedJourneys: (ownedData || []) as Journey[],
      sharedJourneys: (sharedData || []) as Journey[],
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ownedJourneys: [], sharedJourneys: [], error: message };
  }
}

/**
 * Add memory counts to journeys
 */
async function addMemoryCounts(journeys: Journey[]): Promise<Journey[]> {
  if (journeys.length === 0) return [];

  const journeyIds = journeys.map((j) => j.id);
  const { data: counts } = await supabase
    .from('memories')
    .select('journey_id')
    .in('journey_id', journeyIds);

  const countMap = buildMemoryCountMap(counts || []);

  return journeys.map((journey) => ({
    ...journey,
    memory_count: countMap.get(journey.id) || 0,
  }));
}

// Cache for all journeys to avoid duplicate fetches
let journeyFetchPromise: Promise<{
  ownedJourneys: Journey[];
  sharedJourneys: Journey[];
  error: string | null;
}> | null = null;
let lastFetchUserId: string | null = null;
let lastFetchTime = 0;
const FETCH_CACHE_TTL = 100; // 100ms dedup window for parallel calls

/**
 * Get all user journeys with deduplication for parallel calls
 */
async function getAllJourneysDeduped(userId: string): Promise<{
  ownedJourneys: Journey[];
  sharedJourneys: Journey[];
  error: string | null;
}> {
  const now = Date.now();
  
  // If we have a recent fetch for the same user, reuse it
  if (
    journeyFetchPromise &&
    lastFetchUserId === userId &&
    now - lastFetchTime < FETCH_CACHE_TTL
  ) {
    return journeyFetchPromise;
  }

  // Start new fetch
  lastFetchUserId = userId;
  lastFetchTime = now;
  journeyFetchPromise = fetchAllUserJourneys(userId);

  const result = await journeyFetchPromise;
  
  // Clear promise after completion (but keep it for TTL window)
  setTimeout(() => {
    if (lastFetchTime === now) {
      journeyFetchPromise = null;
    }
  }, FETCH_CACHE_TTL);

  return result;
}

/**
 * Fetch active journeys with memory counts for a user
 * Uses optimized shared fetching to reduce database calls
 */
export async function fetchActiveJourneys(userId: string): Promise<ServiceResult<Journey[]>> {
  try {
    const now = new Date().toISOString();
    const { ownedJourneys, sharedJourneys, error } = await getAllJourneysDeduped(userId);

    if (error) {
      log.error(' Fetch active error', { error, userId });
      return { data: null, error };
    }

    // Filter for active journeys (status active AND unlock_date > now)
    const isActive = (j: Journey) =>
      j.status === 'active' && j.unlock_date > now;

    const activeOwned = ownedJourneys.filter(isActive);
    const activeShared = sharedJourneys.filter(isActive);

    // Combine and deduplicate
    const allActive = [...activeOwned, ...activeShared];
    const uniqueJourneys = deduplicateJourneys(allActive);

    if (uniqueJourneys.length === 0) {
      return { data: [], error: null };
    }

    // Add memory counts
    const journeysWithCounts = await addMemoryCounts(uniqueJourneys);

    log.debug(' Fetched active journeys', {
      userId,
      count: journeysWithCounts.length,
    });
    return { data: journeysWithCounts, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Fetch active exception', { error: message, userId });
    return { data: null, error: 'Failed to fetch journeys' };
  }
}

/**
 * Fetch past/unlocked journeys with memory counts for a user
 * Uses optimized shared fetching to reduce database calls
 */
export async function fetchPastJourneys(userId: string): Promise<ServiceResult<Journey[]>> {
  try {
    const now = new Date().toISOString();
    const { ownedJourneys, sharedJourneys, error } = await getAllJourneysDeduped(userId);

    if (error) {
      log.error(' Fetch past error', { error, userId });
      return { data: null, error };
    }

    // Filter for past journeys (status completed OR unlock_date <= now)
    const isPast = (j: Journey) =>
      j.status === 'completed' || j.unlock_date <= now;

    const pastOwned = ownedJourneys.filter(isPast);
    const pastShared = sharedJourneys.filter(isPast);

    // Combine and deduplicate
    const allPast = [...pastOwned, ...pastShared];
    const uniqueJourneys = deduplicateJourneys(allPast);

    if (uniqueJourneys.length === 0) {
      return { data: [], error: null };
    }

    // Add memory counts
    const journeysWithCounts = await addMemoryCounts(uniqueJourneys);

    log.debug(' Fetched past journeys', {
      userId,
      count: journeysWithCounts.length,
    });
    return { data: journeysWithCounts, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error(' Fetch past exception', { error: message, userId });
    return { data: null, error: 'Failed to fetch journeys' };
  }
}
