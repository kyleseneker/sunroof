/**
 * Journey Cache
 * Provides stale-while-revalidate caching for journey data
 */

import type { Journey } from '@/types';
import { createLogger } from './logger';

const log = createLogger('JourneyCache');

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface JourneyCache {
  active: CacheEntry<Journey[]> | null;
  past: CacheEntry<Journey[]> | null;
}

// Cache storage per user
const userCaches = new Map<string, JourneyCache>();

// Cache configuration
const STALE_TIME = 30 * 1000; // 30 seconds - data is fresh
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes - data is usable but should revalidate

type CacheListener = (userId: string) => void;
const listeners = new Set<CacheListener>(); // For future use

/**
 * Get or create cache for a user
 */
function getUserCache(userId: string): JourneyCache {
  let cache = userCaches.get(userId);
  if (!cache) {
    cache = { active: null, past: null };
    userCaches.set(userId, cache);
  }
  return cache;
}

/**
 * Check if cache entry is fresh (no revalidation needed)
 */
function isCacheFresh(entry: CacheEntry<unknown> | null): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < STALE_TIME;
}

/**
 * Check if cache entry is stale but still usable
 */
function isCacheStale(entry: CacheEntry<unknown> | null): boolean {
  if (!entry) return true;
  const age = Date.now() - entry.timestamp;
  return age >= STALE_TIME && age < CACHE_TIME;
}

/**
 * Check if cache entry is expired (unusable)
 */
function isCacheExpired(entry: CacheEntry<unknown> | null): boolean {
  if (!entry) return true;
  return Date.now() - entry.timestamp >= CACHE_TIME;
}

/**
 * Get cached active journeys
 */
export function getCachedActiveJourneys(userId: string): {
  data: Journey[] | null;
  isFresh: boolean;
  isStale: boolean;
} {
  const cache = getUserCache(userId);
  const entry = cache.active;
  
  if (!entry || isCacheExpired(entry)) {
    return { data: null, isFresh: false, isStale: false };
  }
  
  return {
    data: entry.data,
    isFresh: isCacheFresh(entry),
    isStale: isCacheStale(entry),
  };
}

/**
 * Get cached past journeys
 */
export function getCachedPastJourneys(userId: string): {
  data: Journey[] | null;
  isFresh: boolean;
  isStale: boolean;
} {
  const cache = getUserCache(userId);
  const entry = cache.past;
  
  if (!entry || isCacheExpired(entry)) {
    return { data: null, isFresh: false, isStale: false };
  }
  
  return {
    data: entry.data,
    isFresh: isCacheFresh(entry),
    isStale: isCacheStale(entry),
  };
}

/**
 * Set cached active journeys
 */
export function setCachedActiveJourneys(userId: string, data: Journey[]): void {
  const cache = getUserCache(userId);
  cache.active = { data, timestamp: Date.now() };
  log.debug('Active journeys cached', { userId, count: data.length });
  notifyListeners(userId);
}

/**
 * Set cached past journeys
 */
export function setCachedPastJourneys(userId: string, data: Journey[]): void {
  const cache = getUserCache(userId);
  cache.past = { data, timestamp: Date.now() };
  log.debug('Past journeys cached', { userId, count: data.length });
  notifyListeners(userId);
}

/**
 * Invalidate all cache for a user
 */
export function invalidateJourneyCache(userId: string): void {
  userCaches.delete(userId);
  log.debug('Cache invalidated', { userId });
  notifyListeners(userId);
}

/**
 * Get cache timestamp for freshness checks
 */
export function getLastFetchTime(userId: string): number | null {
  const cache = getUserCache(userId);
  const activeTime = cache.active?.timestamp ?? 0;
  const pastTime = cache.past?.timestamp ?? 0;
  const latestTime = Math.max(activeTime, pastTime);
  return latestTime > 0 ? latestTime : null;
}

function notifyListeners(userId: string): void {
  listeners.forEach(listener => listener(userId));
}
